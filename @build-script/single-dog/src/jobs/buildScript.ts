import { addBuildStep, setProjectDir } from '@build-script/builder';
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
		console.log('add ts-esm to build-script');
		setProjectDir(CONTENT_ROOT);
		await addBuildStep(
			'ts-esm',
			['tsc', '-p', 'src/tsconfig.esm.json'],
			['tsc', '-w', '-p', 'src/tsconfig.esm.json']
		);
	}
}
