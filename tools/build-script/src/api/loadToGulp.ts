import * as execa from 'execa';
import { Gulp } from 'gulp';
import * as log from 'fancy-log';
import { ExecFunc } from './types';
import load from './load';

let green: string = '';
let red: string = '';
let reset: string = '';
if (process.stdout.isTTY) {
	green = '\x1B[38;5;2m';
	red = '\x1B[38;5;1m';
	reset = '\x1B[0m';
}

function createJobFunc(jobName: string, path: string, command: string, args: string[]): ExecFunc {
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
		log('%s%s%s: %s %s.', green, jobName, reset, command, args.join(' '));
		await execa(command, args, {
			cwd: path,
			// env.path
			stdio: 'inherit',
		}).then(() => {
			log('%s%s%s: success.', green, jobName, reset);
		}, (e) => {
			log('%s%s%s: failed: %s.', red, jobName, reset, e.message);
			throw e;
		});
	}, {
		displayName: `${jobName}Job`,
		description: `${command} ${args.join(' ')}`,
	});
}

export default function (path: string, gulp: Gulp) {
	const buildConfig = load(path);

	const jobTasks: { [id: string]: ExecFunc } = {};
	for (const [name, job] of Object.entries(buildConfig.jobs)) {
		// console.log('[build-script] load job: %s', name);
		jobTasks[name] = createJobFunc(name, path, job[0], job.slice(1));
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
