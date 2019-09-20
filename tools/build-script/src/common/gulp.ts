import * as execa from 'execa';
import * as Gulp from 'gulp';
import { fatalError } from '../cmd-loader';
import { ExecFunc } from '../global';
import { BuildContext } from './buildContext';
import { getBuildContext, setCurrentDir } from './buildContextInstance';
import { fancyLog } from './fancyLog';
import split2 = require('split2');

let green: string = '';
let red: string = '';
let reset: string = '';
if (process.stdout.isTTY) {
	green = '\x1B[38;5;2m';
	red = '\x1B[38;5;1m';
	reset = '\x1B[0m';
}

function task(gulp: typeof Gulp, taskName: string, fn: Gulp.TaskFunction) {
	fancyLog.info(`defining new task: ${taskName}`);
	gulp.task(taskName, fn);
}

export function load(gulp: typeof Gulp, _dirname: string) {
	setCurrentDir(_dirname);
	const ctx: BuildContext = getBuildContext();
	ctx.init();

	for (const [name, cmd] of ctx.projectJson.alias.entries()) {
		task(
			gulp,
			aliasName(name),
			createJobFunc(aliasName(name), ctx.projectRoot, cmd),
		);
	}

	const needCheckDep: string[] = [];
	for (const [name, data] of ctx.projectJson.job.entries()) {
		const list: Gulp.TaskFunction[] = [];

		if (data.preRun.size) {
			list.push(gulp.parallel(...map(data.preRun, aliasName)));
		}
		if (data.run.size) {
			list.push(gulp.parallel(...map(data.run, aliasNameOrRunner.bind(ctx))));
		}
		if (data.postRun.size) {
			list.push(gulp.parallel(...map(data.preRun, aliasName)));
		}

		const fn = list.length === 0
			? function emptyJob() {}
			: (list.length === 1
					? list[0]
					: gulp.series(...list)
			);

		if (data.after.size) {
			needCheckDep.push(name);
			task(
				gulp,
				jobName(name),
				functionWithName(fn, jobName(name), data.title),
			);
		} else {
			task(
				gulp,
				name,
				functionWithName(fn, name, data.title),
			);
		}
	}

	let loopDetect = 0;
	OUTER: while (needCheckDep.length > 0) {
		const name = needCheckDep.shift()!;
		const data = ctx.projectJson.job.get(name)!;

		let deps: string[] = [];
		for (const item of data.after) {
			if (needCheckDep.includes(item)) {
				needCheckDep.push(name);
				loopDetect++;
				if (loopDetect == needCheckDep.length) {
					fatalError('found loop dependency: ' + needCheckDep.join(', '));
				}
				continue OUTER;
			}
			deps.push(item);
		}

		loopDetect = 0;
		task(
			gulp,
			name,
			functionWithName(gulp.series(
				deps.length === 1 ? deps[0] : gulp.parallel(deps),
				jobName(name),
			), name, data.title),
		);
	}
	// TODO: resolve tree dependency
}

function aliasNameOrRunner(this: BuildContext, name: string) {
	if (name.startsWith('@')) {
		return createOtherJobFunc(name, this.projectRoot);
	} else {
		return aliasName(name);
	}
}

function aliasName(name: string) {
	return 'run:' + name;
}

function jobName(name: string) {
	return 'job:' + name;
}

function map<T, V>(arr: Set<T>, mapper: (v: T) => V): V[] {
	return [...arr.values()].map(mapper);
}

function functionWithName<T extends Gulp.TaskFunction>(fn: T, displayName: string, description: string): T {
	return Object.assign(
		fn,
		{
			displayName,
			description,
		},
	);
}

function createOtherJobFunc(jobName: string, path: string): ExecFunc {
	return createJobFunc(
		'micro-build:' + jobName, path,
		[process.argv[0], process.argv[1], jobName],
	);
}

/*
function createNpmJobFunc(jobName: string, path: string): ExecFunc {
	return createJobFunc(
		'npm:' + jobName, path,
		['npm', 'run', '--scripts-prepend-node-path=true', jobName],
	);
}
*/
function createJobFunc(jobName: string, path: string, cmds: string[]): ExecFunc {
	let [command, ...args] = cmds;
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
	fancyLog.debug('define: %s%s%s: %s %s', green, jobName, reset, command, args.join(' '));
	const callback = async () => {
		fancyLog.info('%s%s%s: %s %s', green, jobName, reset, command, args.join(' '));
		const ps = execa(command, args, {
			cwd: path,
			// env.path
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		ps.stdout!.pipe(split2()).on('data', (l) => {
			fancyLog.debug(l.toString('utf-8'));
		}).resume();
		ps.stderr!.pipe(split2()).on('data', (l) => {
			fancyLog.warn(l.toString('utf-8'));
		}).resume();

		await ps.then(() => {
			fancyLog.info('%s%s%s: success.', green, jobName, reset);
		}, (e) => {
			fancyLog.error('%s%s%s: failed: %s.', red, jobName, reset, e.message);
			throw e;
		});
	};

	return functionWithName(callback, `${jobName}Job`, `${command} ${args.join(' ')}`);
}