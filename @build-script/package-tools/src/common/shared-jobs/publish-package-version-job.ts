import { logger } from '@idlebox/logger';
import { exists } from '@idlebox/node';
import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { TempWorkingFolder } from '../temp-work-folder.js';

export const PUBLISH_PACKAGE_METACACHE_KEY = 'published-package';

// interface StateCache {
// 	id: string;
// 	version: string;
// 	size: number;
// 	unpackedSize: number;
// 	shasum: string;
// 	entryCount: number;
// }

export async function publishPackageVersion(pm: IPackageManager) {
	const wd = new TempWorkingFolder(pm.workspace, 'publish');
	logger.debug('临时目录: %s', wd.path);
	await wd.mkdir();

	const packFile = await pm.pack(wd.path);
	logger.debug('    -> %s', packFile);

	const publish_rc = pm.workspace.getNpmRCPath(true);
	const default_rc = pm.workspace.getNpmRCPath(false);
	if (await exists(publish_rc)) {
		logger.debug('找到配置文件: %s', publish_rc);
		await copyFile(publish_rc, wd.joinpath('.npmrc'));
	} else if (await exists(default_rc)) {
		logger.debug('找到配置文件: %s', default_rc);
		await copyFile(default_rc, wd.joinpath('.npmrc'));
	} else {
		logger.debug('没有找到配置文件.');
	}

	await copyFile(resolve(pm.projectPath, 'package.json'), wd.joinpath('package.json'));

	await pm.uploadTarball(packFile, wd.path);

	const pkg = await pm.loadPackageJson();
	const cache = await pm.createCacheHandler();
	await cache.deleteMetadata(pkg.name);
}
