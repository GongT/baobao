import { logger } from '@idlebox/logger';
import { readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { extract } from 'tar/extract';
import { createTempFolder, projectPath, tempDir } from './constants.js';
import { execPnpm, execPnpmUser } from './exec.js';

export function reconfigurePackageJson(mode: 'pack' | 'publish') {
	const packagePath = resolve(tempDir, 'package/package.json');
	const pkgJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
	if (!pkgJson.private) {
		logger.fatal`package.json is not private, please set "private": true to prevent accidental publishing.`;
	}
	delete pkgJson.private;

	if (pkgJson.scripts) {
		delete pkgJson.scripts.prepublishHook;

		const lifecycles =
			mode === 'pack'
				? ['prepack', 'prepare', 'postpack']
				: ['prepublishOnly', 'prepack', 'prepare', 'postpack', 'publish', 'postpublish'];

		for (const lifecycle of lifecycles) {
			delete pkgJson.scripts[lifecycle];
		}
	}
	writeFileSync(packagePath, JSON.stringify(pkgJson, null, 2));
	return pkgJson;
}

export async function makeTempPackage() {
	await createTempFolder();

	const sourceTgz = resolve(tempDir, 'pack.tgz');
	const decompressedPackagePath = resolve(tempDir, 'package');

	logger.log`使用pnpm构建并打包……`;
	await execPnpm(['--silent', 'pack', '--out', sourceTgz]);
	await decompressTarGz(sourceTgz);

	const nm = resolve(projectPath, 'node_modules');
	logger.verbose`symlink(${nm})`;
	symlinkSync(nm, resolve(decompressedPackagePath, 'node_modules'));

	logger.log`执行prepublishHook……`;
	await execPnpmUser(decompressedPackagePath, ['run', 'prepublishHook']);
	logger.success`prepublishHook成功完成`;
}

async function decompressTarGz(sourceTgz: string): Promise<void> {
	await extract({ gzip: true, file: sourceTgz, cwd: tempDir });
}
