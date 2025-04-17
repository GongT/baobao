import { execLazyError } from '@idlebox/node';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { readJsonSync } from '../inc/fs.js';
import { isVerbose } from '../inc/getArg.js';
import { logger } from '../inc/log.js';
import { monorepo } from '../inc/mono-tools.js';
import { getPackageManager } from './detectRegistry.js';

export async function packCurrentVersion(cwd: string, storeLocation?: string) {
	let result: string;
	logger.log('开始构建本地包...');
	const pm = await getPackageManager();
	logger.log('  使用的包管理器: %s', pm);

	if (!storeLocation) {
		const tmpdir = await monorepo.getTempFolder();
		logger.log('  使用的临时文件夹: %s', tmpdir);
		await mkdir(tmpdir, { recursive: true });
		storeLocation = resolve(tmpdir, 'pack');
	}

	if (pm === 'yarn') {
		let { name, version } = readJsonSync(cwd + '/package.json');
		name = name.replace(/^@/, '').replaceAll('/', '-');
		const chProcess = await execLazyError(
			pm,
			['pack', '--filename', resolve(storeLocation, `${name}-${version}.tgz`), '--json'],
			{
				cwd,
				verbose: isVerbose,
				env: { LANG: 'C.UTF-8' },
			}
		);
		const resultLine = /^{.*"type":"success".*}$/m.exec(chProcess.stdout);
		if (!resultLine) {
			logger.error('[错误] yarn 打包输出: %s', chProcess.stdout);
			throw new Error('运行 yarn 打包失败');
		}
		const ret = JSON.parse(resultLine[0]);
		result = ret.data.replace(/^Wrote tarball to "/, '').replace(/"\.$/, '');
	} else {
		const chProcess = await execLazyError(pm, ['pack', '--pack-destination', storeLocation], {
			cwd,
			verbose: isVerbose,
			env: { LANG: 'C.UTF-8' },
		});
		const lastLine = chProcess.stdout.trim().split('\n').pop() ?? 'empty-output-error';
		result = resolve(cwd, lastLine);
	}

	if (!existsSync(result)) {
		throw new Error(`文件 [${result}] 在打包后必须存在`);
	}

	return result;
}
