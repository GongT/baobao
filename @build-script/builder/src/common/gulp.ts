import { nameFunction } from '@idlebox/common';
import * as Gulp from 'gulp';
import { BuildContext } from './buildContext';
import { getBuildContext, setCurrentDir } from './buildContextInstance';
import { fancyLog } from './fancyLog';
import { functionWithName } from './func';
import { createJobFunc } from './jobs';
import { ExecFunc, MapLike } from '../global';

function task(gulp: typeof Gulp, taskName: string, fn: Gulp.TaskFunction) {
	fancyLog.debug(`defining new task: ${taskName}`);
	gulp.task(taskName, fn);
}

const isPrintingTasks = process.argv.includes('--tasks');

function createAliasRegistry(ctx: BuildContext) {
	const aliasRegistry: MapLike<ExecFunc> = {};
	for (const [name, cmd] of ctx.projectJson.alias.entries()) {
		aliasRegistry[name] = createJobFunc(aliasName(name), ctx.projectRoot, cmd);
		if (isPrintingTasks) {
			console.error('[\x1B[38;5;10m%s\x1B[0m] %s', name, Array.isArray(cmd) ? cmd.join(' ') : cmd);
		}
	}

	return function pickAlias(name: string) {
		if (aliasRegistry[name]) {
			return aliasRegistry[name];
		}
		throw new Error(`Action alias not found: ${name}`);
	};
}

function dependencyResolve(ctx: BuildContext) {
	const waitResolve: MapLike<string[]> = {};
	const orderDepend: string[] = [];

	function isFullFill(deps: string[]) {
		if (deps.length === 0) {
			return true;
		} else if (deps.every((item) => orderDepend.includes(item))) {
			return true;
		}
		return false;
	}

	for (const [name, data] of ctx.projectJson.job.entries()) {
		if (data.run.size) {
			const deps: string[] = [...data.preRun, ...data.run, ...data.postRun]
				.filter((item) => {
					return item.startsWith('@');
				})
				.map((item) => {
					return item.slice(1);
				});

			if (isFullFill(deps)) {
				orderDepend.push(name);
			} else {
				waitResolve[name] = deps;
			}
		}
	}

	while (true) {
		const toResolve = Object.entries(waitResolve);
		const preventLoop = toResolve.length;
		if (preventLoop === 0) {
			break;
		}
		for (const [name, deps] of toResolve) {
			if (isFullFill(deps)) {
				orderDepend.push(name);
				delete waitResolve[name];
			}
		}
		const result = Object.keys(waitResolve).length;
		if (result === 0) {
			break;
		}
		if (result === preventLoop) {
			throw new Error(`Dependency loop found: ${Object.keys(waitResolve).join(', ')}`);
		}
	}

	return orderDepend;
}

function createPickPreviousJob(pickAlias: (name: string) => ExecFunc) {
	const jobRegistry: MapLike<Gulp.TaskFunction> = {};

	function pickJob(n: string) {
		if (jobRegistry[n]) {
			return jobRegistry[n];
		} else {
			throw new Error(`Job name not found: ${n}`);
		}
	}

	return {
		registerJob(name: string, fn: Gulp.TaskFunction) {
			jobRegistry[name] = fn;
		},
		pickJob,
		pickAction(name: string) {
			if (name.startsWith('@')) {
				return pickJob(name.slice(1));
			} else {
				return pickAlias(name);
			}
		},
	};
}

export function load(gulp: typeof Gulp, _dirname: string) {
	setCurrentDir(_dirname);
	const ctx: BuildContext = getBuildContext();
	ctx.loadPlugins();

	const pickAlias = createAliasRegistry(ctx);
	const resolvedDependOrder = dependencyResolve(ctx);

	const { pickJob, pickAction, registerJob } = createPickPreviousJob(pickAlias);

	for (const [name, command] of ctx.projectJson.scriptsJob.entries()) {
		const fn = createJobFunc(name, ctx.projectRoot, command);
		registerJob(name, fn);
		task(gulp, name, functionWithName(fn, name, 'Npm command: ' + name));
	}

	for (const name of resolvedDependOrder) {
		const data = ctx.projectJson.job.get(name)!;
		const list: Gulp.TaskFunction[] = [];

		if (data.preRun.size || data.after.size) {
			list.unshift(
				nameFunction(
					`${name}:pre`,
					gulpConcatAction(gulp, [...map(data.preRun, pickJob), ...map(data.after, pickJob)]) as Function
				) as Gulp.TaskFunction
			);
		}
		if (data.run.size) {
			list.push(
				nameFunction(
					`${name}:run`,
					gulpConcatAction(gulp, map(data.run, pickAction), data.serial) as Function
				) as Gulp.TaskFunction
			);
		}
		if (data.postRun.size) {
			list.push(
				nameFunction(
					`${name}:post`,
					gulpConcatAction(gulp, map(data.preRun, pickJob)) as Function
				) as Gulp.TaskFunction
			);
		}

		const fn = list.length === 0 ? function emptyJob() {} : list.length === 1 ? list[0] : gulp.series(...list);

		registerJob(name, fn);
		task(gulp, name, functionWithName(fn, name, data.title));
	}
}

function gulpConcatAction(gulp: typeof Gulp, fns: (string | ExecFunc)[], toSerial = false): Gulp.TaskFunction {
	if (fns.length === 1) {
		const o = fns.pop();
		if (typeof o === 'string') {
			return gulp.task(o);
		} else {
			return o as ExecFunc;
		}
	} else if (toSerial) {
		return gulp.series(...fns);
	} else {
		return gulp.parallel(...fns);
	}
}

function aliasName(name: string) {
	return 'run:' + name;
}

function map<T, V>(arr: Set<T>, mapper: (v: T) => V): V[] {
	return [...arr.values()].map(mapper);
}
