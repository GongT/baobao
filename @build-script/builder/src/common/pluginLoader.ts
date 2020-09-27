import { nodeResolvePathArray } from '@idlebox/node';
import { setCtxDisable, setCtxEnable } from '../api/ctsStore';
import { getCurrentDir } from './buildContextInstance';
import { fancyLog } from './fancyLog';

export let currentPaths: string[];

export function resetLoader() {
	currentPaths = nodeResolvePathArray(getCurrentDir(), 'node_modules');
	module.paths.length = 0;
	module.paths.push(...currentPaths);
}

export function resolveByLoader(target: string) {
	try {
		return require.resolve(target);
	} catch (e) {
		return undefined;
	}
}

export function loadPlugin(file: string, args: string[]) {
	fancyLog.debug('load plugin: %s', file);
	const mdlPath = resolveByLoader(file);
	if (!mdlPath) {
		fancyLog.error('require paths:');
		for (const path of currentPaths) {
			fancyLog.error('  - %s', path);
		}
		throw new Error(`Can't load plugin module ${file}.`);
	}

	setCtxEnable(file, args);
	try {
		require(file);
	} catch (e) {
		const msg = `Can't run plugin ${file}: ${e.message}`;
		const ee = new Error(msg);
		if (e.stack) {
			const stack = e.stack.split(/\n/);
			stack.splice(0, 1, msg);
			ee.stack = stack.join('\n');
		} else {
			ee.stack = msg;
		}
		throw ee;
	}
	setCtxDisable();
}
