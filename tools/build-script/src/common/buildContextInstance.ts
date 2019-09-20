import { currentPlugin } from '../api/ctsStore';
import { fatalError } from '../cmd-loader';
import { BuildContext } from './buildContext';

const bcs = Symbol.for('@idlebox/build-script');

declare const global: any;
export const loaderProjectPath: string = global.PROJECT_PATH || process.cwd();

let currentPath: string;

export function forceGetContext(): BuildContext {
	return global[bcs];
}

export function createBuildContext(): BuildContext {
	if (global[bcs]) {
		return global[bcs];
	}
	const bc = new BuildContext(loaderProjectPath);
	Object.defineProperty(global, bcs, {
		enumerable: false,
		writable: false,
		configurable: true,
		value: bc,
	});
	return bc;
}

export function getBuildContext(): BuildContext {
	if (global[bcs]) {
		return global[bcs];
	}
	const bc = new BuildContext(getCurrentDir());
	Object.defineProperty(global, bcs, {
		enumerable: false,
		writable: false,
		configurable: true,
		value: bc,
	});
	return bc;
}

let setBy = '@idlebox/micro-build';

export function setCurrentDir(v: string) {
	if (currentPath && currentPath !== v) {
		fatalError(`currentDir is set by ${setBy}, can't set again by ${currentPlugin}. old value=${currentPath}, new value=${v}`);
	}
	currentPath = v;
	setBy = currentPlugin;
}

export function getCurrentDir(): string {
	return currentPath;
}