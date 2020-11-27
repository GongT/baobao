import * as Undertaker from 'undertaker';
import { createRequire } from 'module';

export const _revertSymbolSeries = Symbol.for('@@originalList:series');
export const _revertSymbolParallel = Symbol.for('@@originalList:parallel');

type unmanagedType = string | Undertaker.TaskFunction;
type managedType = unmanagedType | WrappedTaskFunction;
type arrayOr<T> = T[] | T;

type WrappedTaskFunction = Undertaker.TaskFunction & {
	[_revertSymbolSeries]?: unmanagedType[];
	[_revertSymbolParallel]?: unmanagedType[];
};

function wrapList(tasks: arrayOr<managedType>[], symbol: symbol): unmanagedType[] {
	const wrapTasks: unmanagedType[] = [];
	for (const item of tasks) {
		if (Array.isArray(item)) {
			wrapTasks.push(...item);
		} else if (typeof item === 'string') {
			wrapTasks.push(item);
		} else if (symbol in item) {
			wrapTasks.push(...(item as any)[symbol]);
		} else {
			wrapTasks.push(item);
		}
	}
	return wrapTasks;
}

export function series(gulp: Undertaker, ...tasks: managedType[]): WrappedTaskFunction;
export function series(gulp: Undertaker, tasks: managedType[]): WrappedTaskFunction;

export function series(gulp: Undertaker, ...tasks: arrayOr<managedType>[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, _revertSymbolSeries);
	return Object.assign(gulp.series(...wrapTasks), { [_revertSymbolSeries]: wrapTasks });
}

export function gulpSeries(...tasks: managedType[]): WrappedTaskFunction;
export function gulpSeries(tasks: managedType[]): WrappedTaskFunction;

export function gulpSeries(...tasks: arrayOr<managedType>[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, _revertSymbolSeries);
	return Object.assign(parentGulp().series(...wrapTasks), { [_revertSymbolSeries]: wrapTasks });
}

export function parallel(gulp: Undertaker, ...tasks: managedType[]): WrappedTaskFunction;
export function parallel(gulp: Undertaker, tasks: managedType[]): WrappedTaskFunction;

export function parallel(gulp: Undertaker, ...tasks: arrayOr<managedType>[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, _revertSymbolParallel);
	return Object.assign(gulp.parallel(...wrapTasks), { [_revertSymbolParallel]: wrapTasks });
}

export function gulpParallel(...tasks: managedType[]): WrappedTaskFunction;
export function gulpParallel(tasks: managedType[]): WrappedTaskFunction;

export function gulpParallel(...tasks: arrayOr<managedType>[]): WrappedTaskFunction {
	const wrapTasks = wrapList(tasks, _revertSymbolParallel);
	return Object.assign(parentGulp().parallel(...wrapTasks), { [_revertSymbolParallel]: wrapTasks });
}

let gulpInstance: Undertaker;
function parentGulp() {
	if (!gulpInstance) {
		const require = createRequire(import.meta.url);
		const mainRequire = require.main?.require ?? require;
		gulpInstance = mainRequire('gulp');
	}
	return gulpInstance;
}
