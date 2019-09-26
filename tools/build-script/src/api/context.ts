import * as Gulp from 'gulp';
import { forceGetContext, getBuildContext, getCurrentDir, setCurrentDir } from '../common/buildContextInstance';
import { load } from '../common/gulp';
import { currentArgs, currentPlugin } from './ctsStore';

export interface IBuildContext {
	registerAlias(name: string, command: string, args?: string[]): void;
	prefixAction(command: string, jobs: string): void;
	addAction(command: string, jobs: string[], dependency?: string[]): void;
	postfixAction(command: string, jobs: string): void;
	readonly args: ReadonlyArray<string>;
}

export const buildContext = new Proxy({} as any, {
	get(_: any, p: string | number | symbol): any {
		if (currentPlugin) {
			if (p === 'args') {
				return currentArgs;
			} else {
				return forceGetContext();
			}
		} else {
			throw new Error(`Can't use buildContext now. Only available first event loop, no async.`);
		}
	},
});

export function setProjectDir(dir: string) {
	setCurrentDir(dir);
}

export function getProjectDir() {
	return getCurrentDir();
}

export function registerPlugin(name: string, args: string[]): Promise<void> {
	const v = getBuildContext();
	if (!v.isProjectJsonExists()) {
		throw new Error('build-script not init in current project');
	}
	v.pushPlugin(name, args);
	return v.writeBack();
}

export function loadToGulp(gulp: typeof Gulp, __dirname: string) {
	require('source-map-support/register');
	return load(gulp, __dirname);
}

export function isBuildConfigFileExists() {
	const v = getBuildContext();
	return v.isProjectJsonExists();
}
