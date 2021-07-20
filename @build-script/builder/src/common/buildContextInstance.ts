import { currentPlugin } from '../api/ctsStore';
import { fatalError } from '../cmd-loader';
import { BuildContext } from './buildContext';

const bcs = Symbol.for('@build-script/builder');

declare const global: any;
const loaderProjectPath: string = global.PROJECT_PATH || process.cwd();

let currentPath: string;

export function forceGetContext(): any {
	return global[bcs];
}

export function createBuildContext(): BuildContext {
	if (global[bcs]) {
		return global[bcs];
	}
	const bc = new BuildContext(loaderProjectPath, true);
	if (bc.isProjectJsonExists()) {
		fatalError('project already init with build-script.');
	}
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
	if (!getCurrentDir()) {
		throw new Error('Must call "setProjectDir()" before others');
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

let setBy = '@build-script/builder';

export function setCurrentDir(v: string) {
	v = v.replace(/^file:\/\//, '');
	if (currentPath && currentPath !== v) {
		throw new Error(
			`currentDir is set by ${setBy}, can't set again by ${currentPlugin}. old value=${currentPath}, new value=${v}`
		);
	}
	currentPath = v;
	setBy = currentPlugin;
}

export function getCurrentDir(): string {
	return currentPath;
}
