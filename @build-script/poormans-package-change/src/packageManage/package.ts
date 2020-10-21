import { resolve } from 'path';
import { execLazyError } from '@idlebox/node';
import { pathExists } from 'fs-extra';
import { log } from '../inc/log';
import { getPackageManager } from './detectRegistry';

export async function packCurrentVersion(cwd: string) {
	let result: string;
	log('Build local package...');
	const pm = await getPackageManager();
	log('  use package manager: %s', pm);

	if (pm === 'yarn') {
		const chProcess = await execLazyError(pm, ['pack', '--json'], {
			stdout: 'inherit',
			verbose: true,
			env: { LANG: 'C.UTF-8' },
		});
		const resultLine = /^{.*"type":"success".*}$/m.exec(chProcess.stdout);
		if (!resultLine) {
			console.error(chProcess.stdout);
			throw new Error('Failed to run yarn pack.');
		}
		const ret = JSON.parse(resultLine[0]);
		result = ret.data.replace(/^Wrote tarball to "/, '').replace(/"\.$/, '');
	} else {
		const chProcess = await execLazyError(pm, ['pack', '--unsafe-perm'], {
			stdout: 'inherit',
			verbose: true,
			env: { LANG: 'C.UTF-8' },
		});
		result = resolve(cwd, chProcess.stdout.trim());
	}

	if (!pathExists(result)) {
		throw new Error('File [' + result + '] must exists after pack.');
	}

	return result;
}
