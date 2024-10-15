import { sortByString } from '@idlebox/common';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { parse } from 'comment-json';
import { resolve } from 'path';
import { findRushRootPath } from '../../api/load';
import { RushProject } from '../../api/rushProject';
import { description } from '../../common/description';

const template = {
	label: '',
	type: 'process',
	isBackground: true,
	runOptions: { instanceLimit: 1 },
	presentation: {
		echo: true,
		reveal: 'never',
		focus: false,
		panel: 'shared',
		showReuseMessage: false,
		clear: true,
	},
	command: '',
	problemMatcher: {
		base: '$tsc-watch',
		fileLocation: ['relative'],
	},
	group: 'build',
	args: ['run', 'watch'],
	options: {
		_is_build: 'true',
		cwd: '',
	},
};
type VSCodeTask = typeof template;

const defaultTasks = {
	version: '2.0.0',
	tasks: [],
};

export default async function createTasks() {
	const root = await findRushRootPath(process.cwd());
	if (!root) {
		throw new Error('invalid file struct (no rush.json)');
	}
	const rush = new RushProject(root);

	const configFile = resolve(root, '.vscode/tasks.json');
	const tasksJson = await loadJsonFileIfExists(configFile, defaultTasks, 'utf8');

	const pm = '${workspaceFolder}/' + rush.getPackageManager().bin;

	const cfgMap: Record<string, VSCodeTask> = {};
	const names: string[] = [];
	let index = 0;
	for (const { projectFolder, packageName } of rush.projects) {
		index++;
		const pkgs = rush.packageJsonContent(packageName);
		if (!pkgs?.scripts?.watch) {
			continue;
		}

		const cfg = createConfig(index, packageName, projectFolder);
		cfg.command = pm;

		cfgMap[cfg.options.cwd] = cfg;
		names.push(createTitle(index, packageName));
	}

	const WatchAll = `Watch All ${names.length} Projects`;
	let allObj;

	for (let index = tasksJson.tasks.length - 1; index >= 0; index--) {
		const obj = tasksJson.tasks[index];
		if (obj.label.startsWith('Watch All ') && obj.label.endsWith(' Projects')) {
			allObj = obj;
		} else if (obj?.options?._is_build) {
			if (cfgMap[obj.options.cwd]) {
				merge(obj, cfgMap[obj.options.cwd]!);
				delete cfgMap[obj.options.cwd];
			} else {
				tasksJson.tasks.splice(index, 1);
			}
		}
	}
	if (Object.keys(cfgMap).length > 0) {
		tasksJson.tasks.push(...Object.values(cfgMap));
	}

	if (allObj) {
		allObj.label = WatchAll;
	} else {
		allObj = {
			label: WatchAll,
			problemMatcher: [],
		};
		tasksJson.tasks.unshift(allObj);
	}
	allObj.dependsOn = names.sort(sortByString);

	if (await writeJsonFileBack(tasksJson)) {
		console.log('write file: %s', configFile);
	} else {
		console.log('no change: %s', configFile);
	}
}

function createConfig(index: number, title: string, path: string) {
	const json = JSON.stringify(template, null, 4).replace(
		/^{/,
		`{\n\t// This task is created by @build-script/rush-tools`
	);

	const task: VSCodeTask = parse(json) as any;

	task.options.cwd = '${workspaceFolder}/' + path;
	task.label = createTitle(index, title);
	task.problemMatcher.fileLocation.push(task.options.cwd);

	return task;
}

function merge(into: VSCodeTask, source: VSCodeTask) {
	const { problemMatcher, options, ...others } = source;
	Object.assign(into, others);

	if (!into.options) into.options = {} as any;
	Object.assign(into.options, options);

	if (!into.problemMatcher) {
		into.problemMatcher = problemMatcher;
	} else if (Array.isArray(into.problemMatcher)) {
		for (const item of into.problemMatcher) {
			item.fileLocation = problemMatcher.fileLocation;
		}
	} else {
		into.problemMatcher.fileLocation = problemMatcher.fileLocation;
	}
}

function createTitle(index: number, title: string) {
	return `监视（${index}） - ${title}`;
}

description(createTasks, 'Create watch all tasks define by rush.json.');
