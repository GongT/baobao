import { nodeResolvePathArray } from '@idlebox/platform';
import { resolve } from 'path';
import { fancyLog } from '../inc/fancyLog';
import { IBuildScriptJson } from './types';

/** @internal */
export let buildConfig: IBuildScriptJson | null;

export default function (path: string): IBuildScriptJson {
	const ret: IBuildScriptJson = buildConfig = require(resolve(path, 'build-script.json'));

	if (!ret.plugins) {
		ret.plugins = [];
	}
	if (!ret.actions) {
		ret.actions = {};
	}
	if (!ret.jobs) {
		ret.jobs = {};
	}

	const paths = nodeResolvePathArray(path, 'node_modules');

	const originalArgv = process.argv;
	for (const { name: pluginName, args } of ret.plugins) {
		fancyLog.debug('load plugin: %s', pluginName);
		let loaded = false;
		for (const path of paths) {
			try {
				const pluginFile = resolve(path, pluginName);
				process.argv = [process.argv0, pluginFile, ...(args || [])];
				require(pluginFile);
				fancyLog.debug('found in: %s', path);
				loaded = true;
			} catch {
			}
		}

		if (!loaded) {
			fancyLog.error('require paths:');
			for (path of paths) {
				fancyLog.error('  - %s', path);
			}
			throw new Error('Cannot load plugin: ' + pluginName);
		}
	}
	process.argv = originalArgv;

	buildConfig = null;

	return ret;
}
