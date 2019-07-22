import * as execa from 'execa';
import * as log from 'fancy-log';
import { Gulp } from 'gulp';
import { fancyLog } from '../inc/fancyLog';
import load from './load';
import { ExecFunc } from './types';

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

export default function (gulp: Gulp, path: string = process.cwd()): { [id: string]: ExecFunc } {
	const buildConfig = load(path);
	// fancyLog.debug(buildConfig);

	const jobTasks: { [id: string]: ExecFunc } = {};
	for (const [name, job] of Object.entries(buildConfig.jobs)) {
		fancyLog.debug('[build-script] load job: %s = %s', name, job[0]);
		jobTasks[name] = createJobFunc(name, path, job[0], job.slice(1));
	}

	const emptyTasks: { [id: string]: true } = {};
	const actionTasks: { [id: string]: ExecFunc } = {};
	const exportedActionTasks: { [id: string]: ExecFunc } = {};
	const actionsRef = { ...buildConfig.actions };
	while (true) {
		const before = Object.keys(actionsRef).length;

		ACTION_LOOP: for (const [actionName, { type, exported, sequence }] of Object.entries(actionsRef)) {
			fancyLog.debug('walk: %s = %s', actionName, sequence.join(', '));
			const resolved: ExecFunc[] = [];
			for (const jobName of sequence) {
				if (jobName.startsWith('@')) {
					const wantAction = jobName.slice(1);
					if (emptyTasks[wantAction]) {
						continue;
					} else if (actionTasks[wantAction]) {
						resolved.push(actionTasks[wantAction]);
					} else if (actionsRef[wantAction]) {
						fancyLog.debug('wait other action "%s" when loading action: %s', jobName, actionName);
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
				fancyLog.debug('load empty action: %s', actionName);
				emptyTasks[actionName] = true;
				continue;
			}

			if (resolved.length === 1) {
				actionTasks[actionName] = resolved[0];
			} else {
				if (type === 'serial') {
					fancyLog.debug('load serial action: %s = %s', actionName, resolved.map(func => func.displayName).join(', '));
					actionTasks[actionName] = gulp.series(...resolved);
				} else {
					fancyLog.debug('load parallel action: %s = %s', actionName, resolved.map(func => func.displayName).join(', '));
					actionTasks[actionName] = gulp.parallel(...resolved);
				}
				Object.assign(actionTasks[actionName], { displayName: actionName + 'Action' });
			}
			if (exported) {
				fancyLog.debug('export action: %s = %s', actionName, resolved.map(func => func.displayName).join(', '));
				exportedActionTasks[actionName] = actionTasks[actionName];
				gulp.task(actionName, actionTasks[actionName]);
			}
		}

		const after = Object.keys(actionsRef).length;
		fancyLog.debug('before=%s, after=%s', before, after);
		if (after === 0) {
			break;
		}
		if (before === after) {
			throw new Error('Cannot resolve some action: ' + Object.keys(actionsRef).join(', ') + '.');
		}
	}

	return exportedActionTasks;
}
