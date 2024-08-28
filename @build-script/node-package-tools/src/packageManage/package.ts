import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { execLazyError } from '@idlebox/node';
import { log } from '../inc/log';
import { getTempFolder } from '../inc/rush';
import { getPackageManager } from './detectRegistry';

export async function packCurrentVersion(cwd: string) {
	let result: string;
	log('Build local package...');
	const pm = await getPackageManager();
	log('  use package manager: %s', pm);

	const tmpdir = getTempFolder(cwd);
	log('  use temp folder: %s', tmpdir);
	await mkdir(tmpdir, { recursive: true });

	if (pm === 'yarn') {
		let { name, version } = require(cwd + '/package.json');
		name = name.replace(/^@/, '').replaceAll('/', '-');
		const chProcess = await execLazyError(
			pm,
			['pack', '--filename', resolve(tmpdir, `${name}-${version}.tgz`), '--json'],
			{
				cwd,
				stdout: 'inherit',
				verbose: true,
				env: { LANG: 'C.UTF-8' },
			},
		);
		const resultLine = /^{.*"type":"success".*}$/m.exec(chProcess.stdout);
		if (!resultLine) {
			console.error('[Error] yarn pack output: %s', chProcess.stdout);
			throw new Error('Failed to run yarn pack.');
		}
		const ret = JSON.parse(resultLine[0]);
		result = ret.data.replace(/^Wrote tarball to "/, '').replace(/"\.$/, '');
	} else {
		const chProcess = await execLazyError(pm, ['pack', '--pack-destination', tmpdir], {
			stdout: 'pipe',
			verbose: true,
			env: { LANG: 'C.UTF-8' },
		});
		const lastLine = chProcess.stdout.trim().split('\n').pop()!;
		result = resolve(cwd, lastLine);
	}

	if (!existsSync(result)) {
		throw new Error('File [' + result + '] must exists after pack.');
	}

	return result;
}
