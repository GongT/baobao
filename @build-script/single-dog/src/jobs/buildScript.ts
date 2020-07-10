import { resolve } from 'path';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { Filesystem } from '../inc/filesystem';
import { spawnSyncLog } from '../inc/spawn';
import { IRunMode } from './packageJson';

export async function runBuildScriptInit(fs: Filesystem, { libMode }: IRunMode) {
	if (!fs.exists('build-script.json')) {
		spawnSyncLog('build-script', ['init'], {
			stdio: 'inherit',
			cwd: CONTENT_ROOT,
		});
	}

	if (libMode) {
		const buildJson = await loadJsonFile(resolve(CONTENT_ROOT, 'build-script.json'));

		buildJson.alias['build-ts'] = 'ttsc -p src';
		buildJson.alias['watch-ts'] = 'ttsc -w -p src';

		await writeJsonFileBack(buildJson);
	}
}
