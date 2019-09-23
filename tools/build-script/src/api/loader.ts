import { nodeResolvePathArray } from '@idlebox/platform';
import { fancyLog } from '../common/fancyLog';
import { fatalError } from '../cmd-loader';
import { getCurrentDir } from '../common/buildContextInstance';
import { setCtxDisable, setCtxEnable } from './ctsStore';

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
		fatalError(`Can't load plugin module ${file}.`);
	}

	setCtxEnable(file, args);
	try {
		require(file);
	} catch (e) {
		fatalError(`Can't run plugin ${file}: ${e.message}`);
	}
	setCtxDisable();
}
