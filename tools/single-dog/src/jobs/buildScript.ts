import { setProjectDir } from '@idlebox/build-script';
import { Filesystem } from '../inc/filesystem';

export async function runBuildScriptInit(fs: Filesystem) {
	if (!fs.exists('build-script.json')) {
		fs.exec('build-script init');
	}
	setProjectDir(process.cwd());

}
