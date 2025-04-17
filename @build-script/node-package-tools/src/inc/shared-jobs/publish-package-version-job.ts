import { type IPackageJson } from '@idlebox/common';
import { execLazyError, findUpUntil } from '@idlebox/node';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { packCurrentVersion } from '../../packageManage/package.js';
import { isDebugMode } from '../getArg.js';
import { logger } from '../log.js';
import { PackageMetaCache } from '../meta-cache.js';
import { monorepo } from '../mono-tools.js';

export const PUBLISH_PACKAGE_METACACHE_KEY = 'published-package';

interface StateCache {
	id: string;
	version: string;
	size: number;
	unpackedSize: number;
	shasum: string;
	entryCount: number;
}

export async function publishPackageVersion(packageLocation: string, packageJson: IPackageJson) {
	const metacache = new PackageMetaCache();
	const meta = await metacache.getCacheData<StateCache>(packageJson.name, PUBLISH_PACKAGE_METACACHE_KEY, 30 * 60);
	const laststate = meta.get();
	if (laststate?.version === packageJson.version) {
		logger.log(' -> 发布: 版本号没有改变: %s', laststate.version);
		return null;
	}

	const result = await realPublish(packageLocation, packageJson);
	await meta.set(result);

	return result;
}

async function realPublish(packagePath: string, packageJson: IPackageJson) {
	logger.debug('打包当前版本: %s', packagePath);
	const packFile = await packCurrentVersion(packagePath);
	logger.debug('    打包: %s', packFile);

	const tmpdir = resolve(await monorepo.getTempFolder(), 'publish/working');
	logger.debug('临时目录: %s', tmpdir);
	await mkdir(tmpdir, { recursive: true });

	const root = await monorepo.getRoot();
	let publish_rc = await findUpUntil({ file: '.npmrc-publish', from: packagePath, top: root });
	if (!publish_rc) {
		publish_rc = await findUpUntil({ file: '.npmrc', from: packagePath, top: root });
	}
	if (publish_rc) {
		logger.debug('找到配置文件: %s', publish_rc);
		await copyFile(publish_rc, resolve(tmpdir, '.npmrc'));
	}
	await writeFile(resolve(tmpdir, 'package.json'), JSON.stringify(packageJson), 'utf8');

	logger.debug('上传包到远程');
	// TODO: 其他管理器
	const result = await execLazyError('pnpm', ['publish', packFile, '--json', '--no-git-checks'], { cwd: tmpdir });
	const pubresult: IPnpmPublishResult = JSON.parse(result.stdout);

	logger.log('发布成功: %s ', pubresult.id);

	if (!isDebugMode) {
		logger.debug('删除临时目录');
		await rm(tmpdir, { force: true, recursive: true });
		await rm(packFile, { force: true });
	} else {
		logger.debug('由于是调试模式，不删除临时文件夹: %s', tmpdir);
	}

	return {
		id: pubresult.id,
		version: pubresult.version,
		size: pubresult.size,
		unpackedSize: pubresult.unpackedSize,
		shasum: pubresult.shasum,
		entryCount: pubresult.entryCount,
	} as StateCache;
}

interface IPnpmPublishResult {
	id: string;
	name: string;
	version: string;
	size: number;
	unpackedSize: number;
	shasum: string; // 'e320229fe019545b8e384ff19961de18d83c2673';
	integrity: string; // 'sha512-0HwCZquIeAlDPVBfb9FEpvD+fzRaw+t7+K9L4cUKFi0l2NbClu/YnmBt9rJy/pdkkfcnuB1CS7lBfsUN6AwVCA==';
	filename: string; // 'idlebox-common-1.4.2.tgz';
	files: {
		path: string;
		size: number;
		mode: number;
	}[];
	entryCount: number;
	bundled: []; // ?
}
