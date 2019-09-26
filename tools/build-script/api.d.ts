declare module '@idlebox/build-script' {
	import Gulp = require('gulp');

	interface IBuildContext {
		registerAlias(name: string, command: string, args?: ReadonlyArray<string>): void;
		prefixAction(command: string, jobs: string): void;
		addAction(command: string, jobs: ReadonlyArray<string>, dependency?: ReadonlyArray<string>): void;
		postfixAction(command: string, jobs: string): void;
		readonly args: ReadonlyArray<string>;
	}

	export const buildContext: IBuildContext;

	export function setProjectDir(dir: string): void;

	export function getProjectDir(): void;

	export function registerPlugin(name: string, args: string[]): Promise<void>;

	export function loadToGulp(gulp: typeof Gulp, __dirname: string): void;

	export function isBuildConfigFileExists(): boolean;
}