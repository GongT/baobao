import * as Gulp from 'gulp';
import { fatalError } from '../cmd-loader';
import { ExecFunc } from '../global';
import { BuildContext } from './buildContext';
import { getBuildContext, setCurrentDir } from './buildContextInstance';
import { fancyLog } from './fancyLog';
import { functionWithName } from './func';
import { createJobFunc, createOtherJobFunc } from './jobs';

function task(gulp: typeof Gulp, taskName: string, fn: Gulp.TaskFunction) {
	fancyLog.debug(`defining new task: ${taskName}`);
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
			list.push(gulpParallel(gulp, map(data.preRun, aliasName)));
		}
		if (data.run.size) {
			list.push(gulpParallel(gulp, map(data.run, aliasNameOrRunner.bind(ctx))));
		}
		if (data.postRun.size) {
			list.push(gulpParallel(gulp, map(data.preRun, aliasName)));
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

function gulpParallel(gulp: typeof Gulp, fns: (string | ExecFunc)[]): Gulp.TaskFunction {
	if (fns.length === 1) {
		const o = fns.pop();
		if (typeof o === 'string') {
			return gulp.task(o);
		} else {
			return o as ExecFunc;
		}
	} else {
		return gulp.parallel(...fns);
	}
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
