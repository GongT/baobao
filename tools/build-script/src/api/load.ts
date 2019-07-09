import { IBuildScriptJson } from './types';
import { resolve } from 'path';

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

	for (const plugin of ret.plugins) {
		console.log('[build-script] load plugin: %s', plugin);
		require(plugin);
	}
	buildConfig = null;

	return ret;
}
