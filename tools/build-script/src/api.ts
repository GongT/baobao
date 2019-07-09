import { resolve } from 'path';
import * as execa from 'execa';
import { Gulp } from 'gulp';

function createJobFunc(jobName: string, command: string, args: string[]): ExecFunc {
	if (!command) {
		throw new Error(`job ${jobName} has no command line`);
	}

	if (command.endsWith('.js')) {
		args.unshift(command);
		command = 'node';
	} else if (command.endsWith('.ts')) {
		args.unshift(command);
		command = 'ts-node';
	}
	return Object.assign(async () => {
		await execa(command, args, {
			cwd: PROJECT_ROOT,
			// env.path
			stdio: 'inherit',
		});
	}, {
		displayName: `${jobName}Job`,
		description: `${command} ${args.join(' ')}`,
	});

}

export function loadToGulp(gulp: Gulp) {
	const buildConfig = load();
	for (const plugin of buildConfig.plugins) {
		console.log('[build-script] load plugin: %s', plugin);
		loadPlugin(buildConfig, plugin);
	}

	const jobTasks: { [id: string]: ExecFunc } = {};
	for (const [name, job] of Object.entries(buildConfig.jobs)) {
		// console.log('[build-script] load job: %s', name);
		jobTasks[name] = createJobFunc(name, job[0], job.slice(1));
	}

	const emptyTasks: { [id: string]: true } = {};
	const actionTasks: { [id: string]: ExecFunc } = {};
	const exportedActionTasks: { [id: string]: ExecFunc } = {};
	const actionsRef = { ...buildConfig.actions };
	while (true) {
		const before = Object.keys(actionsRef).length;

		ACTION_LOOP: for (const [actionName, { type, exported, sequence }] of Object.entries(actionsRef)) {
			const resolved: ExecFunc[] = [];
			for (const jobName of sequence) {
				if (jobName.startsWith('@')) {
					const wantAction = jobName.slice(1);
					if (emptyTasks[wantAction]) {
						continue;
					} else if (actionTasks[wantAction]) {
						resolved.push(actionTasks[wantAction]);
					} else if (actionsRef[wantAction]) {
						// console.log('[build-script] wait other action "%s" when loading action: %s', jobName, actionName);
						continue ACTION_LOOP;
					} else {
						throw new Error(`Unknown action "${jobName}" in action "${actionName}"`);
					}
				} else if (jobTasks[jobName]) {
					resolved.push(jobTasks[jobName]);
				} else {
					throw new Error(`Unknown job "${jobName}" in action "${actionName}"`);
				}
			}
			if (!resolved.every(item => !!item)) {
				continue;
			}

			delete actionsRef[actionName];
			if (resolved.length === 0) {
				// console.log('[build-script] load empty action: %s', actionName);
				emptyTasks[actionName] = true;
				continue;
			}

			if (resolved.length === 1) {
				actionTasks[actionName] = resolved[0];
			} else {
				if (type === 'serial') {
					// console.log('[build-script] load serial action: %s', actionName);
					actionTasks[actionName] = gulp.series(...resolved);
				} else {
					// console.log('[build-script] load parallel action: %s', actionName);
					actionTasks[actionName] = gulp.parallel(...resolved);
				}
				Object.assign(actionTasks[actionName], { displayName: actionName + 'Action' });
			}
			if (exported) {
				// console.log('[build-script] export action: %s', actionName);
				exportedActionTasks[actionName] = actionTasks[actionName];
				gulp.task(actionName, actionTasks[actionName]);
			}
		}

		const after = Object.keys(actionsRef).length;
		// console.log('[build-script] before=%s, after=%s', before, after);
		if (after === 0) {
			break;
		}
		if (before === after) {
			throw new Error('Cannot resolve some action: ' + Object.keys(actionsRef).join(', ') + '.');
		}
	}

	return exportedActionTasks;
}

function load(): IBuildScriptJson {
	return require(resolve(PROJECT_ROOT, 'build-script.json'));
}

function loadPlugin(buildConfig: any, plugin: string) {
	return require(plugin).default(buildConfig);
}
