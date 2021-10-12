declare module '@build-script/builder' {
	import Gulp = require('gulp');

	interface IBuildContext {
		registerAlias(name: string, command: string, args?: ReadonlyArray<string>): void;
		prefixAction(command: string, jobs: string[]): void;
		addAction(command: string, jobs: ReadonlyArray<string>, dependency?: ReadonlyArray<string>): void;
		postfixAction(command: string, jobs: string[]): void;
		setRunMode(command: string, mod: 'serial' | 'parallel'): void;
		readonly args: ReadonlyArray<string>;
	}

	interface IJobRecord {
		[name: string]: Gulp.TaskFunction;
	}

	export const buildContext: IBuildContext;

	export function setProjectDir(dir: string): void;

	export function getProjectDir(): string;

	export function registerPlugin(name: string, args: string[]): Promise<void>;

	export function getPlugin(name: string): Promise<string[] | void>;

	export function addBuildStep(name: string, build: string[], watch: string[]): Promise<void>;

	export function loadToGulp(gulp: typeof Gulp, __dirname: string): IJobRecord;

	export function gulpParallel(tasks: (string | Gulp.TaskFunction)[]): Gulp.TaskFunction;
	export function gulpSeries(tasks: (string | Gulp.TaskFunction)[]): Gulp.TaskFunction;

	export function isBuildConfigFileExists(): boolean;
}
