import { logger } from '@idlebox/logger';
import { readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createTempFolder, getDecompressed, projectPath, tempDir } from './constants.js';
import { execPnpm, execPnpmUser } from './exec.js';
import { decompressTarGz } from './tar.js';

export function reconfigurePackageJson(mode: 'pack' | 'publish') {
	const packagePath = resolve(tempDir, 'package/package.json');
	const pkgJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

	if (pkgJson.scripts) {
		delete pkgJson.scripts.prepublishHook;

		const lifecycles =
			mode === 'pack'
				? ['prepack', 'prepare', 'postpack']
				: ['prepublishOnly', 'prepack', 'prepare', 'postpack', 'publish', 'postpublish'];

		for (const lifecycle of lifecycles) {
			if (pkgJson.scripts[lifecycle]) {
				logger.debug`删除生命周期脚本 ${lifecycle}`;
			}
			delete pkgJson.scripts[lifecycle];
		}
	}
	writeFileSync(packagePath, JSON.stringify(pkgJson, null, 2));
	return pkgJson;
}

export async function makeTempPackage() {
	await createTempFolder();

	const tempPackagePath = getDecompressed();

	const sourceTgz = resolve(tempDir, 'pnpm-packed-simple.tgz');

	logger.log`使用pnpm构建并打包……`;
	await execPnpm(['--silent', 'pack', '--out', sourceTgz]);

	logger.debug`已打包为 relative<${sourceTgz}>`;

	await decompressTarGz(sourceTgz, tempDir);

	logger.debug`已解压到 relative<${tempPackagePath}>`;

	const nm = resolve(projectPath, 'node_modules');
	logger.verbose`symlink: long<${nm}>`;
	symlinkSync(nm, resolve(tempPackagePath, 'node_modules'));

	logger.log`执行prepublishHook……`;
	await execPnpmUser(tempPackagePath, ['run', '--silent', '--if-present', 'prepublishHook']);
	logger.success`prepublishHook成功完成`;
}
