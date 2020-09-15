import { resolve } from 'path';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { parse } from 'comment-json';
import { findRushRootPath } from '../api/load';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

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
		showReuseMessage: true,
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
	for (const { projectFolder, packageName } of rush.projects) {
		const pkgs = rush.packageJsonContent(packageName);
		if (!pkgs?.scripts?.watch) {
			continue;
		}

		const cfg = createConfig(packageName, projectFolder);
		cfg.command = pm;

		cfgMap[cfg.options.cwd] = cfg;
		names.push(createTitle(packageName));
	}

	const WatchAll = 'Watch All';
	let allObj;

	for (let index = tasksJson.tasks.length - 1; index >= 0; index--) {
		const obj = tasksJson.tasks[index];
		if (obj.label === WatchAll) {
			allObj = obj;
		} else if (obj?.options?._is_build) {
			if (cfgMap[obj.options.cwd]) {
				tasksJson.tasks[index] = cfgMap[obj.options.cwd];
				delete cfgMap[obj.options.cwd];
			} else {
				tasksJson.tasks.splice(index, 1);
			}
		}
	}
	if (Object.keys(cfgMap).length > 0) {
		tasksJson.tasks.push(...Object.values(cfgMap));
	}

	if (!allObj) {
		allObj = {
			label: WatchAll,
			problemMatcher: [],
		};
		tasksJson.tasks.unshift(allObj);
	}
	allObj.dependsOn = names;

	if (writeJsonFileBack(tasksJson)) {
		console.log('write file: %s', configFile);
	} else {
		console.log('no change: %s', configFile);
	}
}

function createConfig(title: string, path: string) {
	const json = JSON.stringify(template, null, 4).replace(
		/^{/,
		`{\n\t// This task is created by @build-script/rush-tools`
	);

	const task: VSCodeTask = parse(json);

	task.options.cwd = '${workspaceFolder}/' + path;
	task.label = createTitle(title);
	task.problemMatcher.fileLocation.push(task.options.cwd);

	return task;
}

function createTitle(title: string) {
	return '监视 - ' + title;
}

description(createTasks, 'Create watch all tasks define from .');
