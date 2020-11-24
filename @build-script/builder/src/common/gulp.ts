import { resolve } from 'path';
import { inspect } from 'util';
import { functionName, nameFunction } from '@idlebox/common';
import { findUpUntilSync } from '@idlebox/node';
import { pathExistsSync } from 'fs-extra';
import Gulp, { TaskFunction } from 'gulp';
import { ExecFunc, MapLike } from '../global';
import { BuildContext } from './buildContext';
import { getBuildContext, setCurrentDir } from './buildContextInstance';
import { fancyLog, isVerbose } from './fancyLog';
import { functionWithName } from './func';
import { createJobFunc } from './jobs';

function task(gulp: typeof Gulp, taskName: string, fn: Gulp.TaskFunction) {
	fancyLog.debug(`define task to gulp: ${taskName} = ${functionName(fn as any)}`);
	gulp.task(taskName, fn);
}

const isPrintingTasks = process.argv.includes('--tasks');

function createAliasRegistry(gulp: typeof Gulp, ctx: BuildContext) {
	const aliasRegistry: MapLike<ExecFunc> = {};
	for (const [name, cmd] of ctx.projectJson.alias.entries()) {
		aliasRegistry[name] = createJobFunc(aliasName(name), ctx.projectRoot, cmd);
		if (isPrintingTasks) {
			console.error('[\x1B[38;5;10m%s\x1B[0m] %s', name, Array.isArray(cmd) ? cmd.join(' ') : cmd);
		}
	}

	return function pickAlias(name: string, throwe = true) {
		if (aliasRegistry[name]) {
			return aliasRegistry[name];
		}
		if (gulp.task(name)) {
			return name;
		}
		if (throwe) {
			throw `Action alias not found: "${name}"`;
		}
		return '';
	};
}

function dependencyResolve(ctx: BuildContext) {
	fancyLog.debug('resolve dependency:');
	const waitResolve: MapLike<string[]> = {};
	const orderDepend: string[] = [];

	function isFullFill(deps: string[]) {
		if (deps.some((item) => waitResolve[item])) {
			return false;
		}
		return true;
	}
	for (const [name, data] of ctx.projectJson.job.entries()) {
		const deps: string[] = [...data.preRun, ...data.postRun, ...data.after];
		for (const item of data.run.values()) {
			if (item.startsWith('@')) {
				deps.push(item.slice(1));
			}
		}

		if (deps.length === 0) {
			fancyLog.debug('  - %s (no need) is resolved', name, deps.join(', '));
			orderDepend.push(name);
		} else {
			fancyLog.debug('  - %s (depend %s) to be resolve', name, deps.join(', '));
			waitResolve[name] = deps;
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
				fancyLog.debug('  - %s is resolved', name);
				orderDepend.push(name);
				delete waitResolve[name];
			}
		}
		const result = Object.keys(waitResolve).length;
		if (result === 0) {
			break;
		}
		if (result === preventLoop) {
			const lserror = Object.keys(waitResolve).join(', ');
			const lssuccess = orderDepend.join(', ');
			throw new Error(`Dependency loop found: ${lserror} | success: ${lssuccess}`);
		}
	}

	fancyLog.debug('DONE: %s', orderDepend.join(', '));
	return orderDepend;
}

function createPickPreviousJob(pickAlias: (name: string) => string | ExecFunc) {
	const jobRegistry: MapLike<Gulp.TaskFunction> = {};

	function pickJob(n: string) {
		if (jobRegistry[n]) {
			return jobRegistry[n];
		} else {
			return n;
		}
	}
	function requireJob(n: string): Gulp.TaskFunction {
		if (jobRegistry[n]) {
			return jobRegistry[n];
		} else {
			throw new Error(`Job name not found: ${n} (available: ${Object.keys(jobRegistry).join(', ')})`);
		}
	}

	return {
		registerJob(name: string, fn: Gulp.TaskFunction) {
			if (jobRegistry[name]) {
				throw new Error(
					`duplicate job: ${name} = ${functionName(jobRegistry[name] as any)} | new: ${functionName(
						fn as any
					)}`
				); // this is impossible
			}
			jobRegistry[name] = fn;
		},
		pickJob,
		requireJob,
		pickAction(name: string) {
			if (name.startsWith('@')) {
				return pickJob(name.slice(1));
			} else {
				return pickAlias(name);
			}
		},
	};
}

interface FindGulpFile {
	file: string;
	supportModule?: string;
}
export function findGulpfile(where: string = process.cwd(), findUp: boolean = false): null | FindGulpFile {
	const gulpSupports = {
		js: '',
		ts: 'ts-node',
		'esm.js': '',
		'babel.js': '@babel/register',
	};
	for (const base of ['gulpfile', 'Gulpfile']) {
		for (const [ext, supportModule] of Object.entries(gulpSupports)) {
			if (findUp) {
				const file = findUpUntilSync(where, base + '.' + ext);
				if (file) {
					return { file, supportModule };
				}
			} else {
				const file = resolve(where, base + '.' + ext);
				if (pathExistsSync(file)) {
					return { file, supportModule };
				}
			}
		}
	}
	return null;
}

export interface IJobRecord {
	[name: string]: TaskFunction;
}
export function load(gulp: typeof Gulp, _dirname: string): IJobRecord {
	const result: IJobRecord = {};
	setCurrentDir(_dirname);
	const ctx: BuildContext = getBuildContext();
	ctx.loadPlugins();

	if (isVerbose) {
		const b = '-'.repeat(process.stderr.columns || 80);
		console.error(
			'\r%s\n%s\n%s',
			b,
			inspect(ctx.projectJson, { colors: true, depth: Infinity, maxStringLength: 20, getters: true }),
			b
		);
	}

	const pickAlias = createAliasRegistry(gulp, ctx);
	const resolvedDependOrder = dependencyResolve(ctx);

	const { pickJob, pickAction, registerJob, requireJob } = createPickPreviousJob(pickAlias);

	for (const [name, command] of ctx.projectJson.scriptsJob.entries()) {
		if (resolvedDependOrder.includes(name)) {
			continue;
		}
		const fn = createJobFunc(name, ctx.projectRoot, command);
		if (isPrintingTasks) {
			console.error('[\x1B[38;5;9m%s\x1B[0m] npm: %s', name, command);
		}
		registerJob(name, fn);
		task(gulp, name, functionWithName(fn, 'npm:' + name, 'Npm command: ' + name));
	}

	for (const name of resolvedDependOrder) {
		if (isPrintingTasks) {
			fancyLog.debug(' -- %s:', name);
		}
		const data = ctx.projectJson.job.get(name)!;
		const list: Gulp.TaskFunction[] = [];

		if (data.after.size) {
			list.unshift(gulpConcatAction(gulp, `${name}:wait`, map(data.after, pickJob)));
		}
		if (data.preRun.size) {
			list.unshift(gulpConcatAction(gulp, `${name}:pre`, map(data.preRun, requireJob)));
		}
		if (data.run.size) {
			list.push(gulpConcatAction(gulp, `${name}:run`, map(data.run, pickAction), data.serial));
		}
		if (data.postRun.size) {
			list.push(gulpConcatAction(gulp, `${name}:post`, map(data.postRun, requireJob)));
		}

		let fn: ExecFunc;
		if (list.length === 0) {
			fn = emptyAction;
		} else if (list.length === 1) {
			fn = list[0];
			if (typeof fn === 'string') {
				fn = gulp.task(fn);
			}
		} else {
			fn = wrapSeries(list);
		}
		registerJob(name, fn);
		const handler = functionWithName(fn, name, data.title);
		if (!data.createByPlugin) {
			task(gulp, name, handler);
		} else {
			fancyLog.debug(`private task: ${name} = ${functionName(fn as any)}`);
		}
		result[name] = handler;
	}

	return result;
}

function gulpConcatAction(
	gulp: typeof Gulp,
	title: string,
	fns: (string | TaskFunction)[],
	toSerial = false
): TaskFunction {
	let ret: TaskFunction;
	if (fns.length === 0) {
		fancyLog.warn('job %s has no actions', title);
		return emptyAction;
	} else if (fns.length === 1) {
		const o = fns.pop()!;
		if (typeof o === 'string') {
			return gulp.task(o);
		} else {
			return o;
		}
	} else if (toSerial) {
		ret = wrapSeries(fns);
	} else {
		ret = wrapParallel(fns);
	}
	nameFunction(title, ret as any);

	return ret;
}

function aliasName(name: string) {
	return 'run:' + name;
}

function map<T, V>(arr: Set<T>, mapper: (v: T) => V): V[] {
	return [...arr.values()].map(mapper);
}

const emptyAction = nameFunction('noop', () => {});

const revertSymbolSeries = Symbol('@@originalList:');
const revertSymbolParallel = Symbol('@@originalList:');

type WrappedTaskFunction = TaskFunction & {
	[revertSymbolSeries]?: (string | TaskFunction)[];
	[revertSymbolParallel]?: (string | TaskFunction)[];
};

function wrapList(tasks: (string | TaskFunction | WrappedTaskFunction)[], symbol: symbol): (string | TaskFunction)[] {
	const wrapTasks: (string | TaskFunction)[] = [];
	for (const item of tasks) {
		if (symbol in (item as any)) {
			wrapTasks.push(...(item as any)[symbol]);
		} else {
			wrapTasks.push(item);
		}
	}
	return wrapTasks;
}

function wrapSeries(tasks: (string | TaskFunction | WrappedTaskFunction)[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, revertSymbolSeries);
	return Object.assign(Gulp.series(...wrapTasks), { [revertSymbolSeries]: wrapTasks });
}

function wrapParallel(tasks: (string | TaskFunction | WrappedTaskFunction)[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, revertSymbolParallel);
	return Object.assign(Gulp.parallel(...wrapTasks), { [revertSymbolParallel]: wrapTasks });
}
