import type { IPackageJson } from '@idlebox/common';
import { PathEnvironment } from '@idlebox/node';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gt } from 'semver';
import { getTarballCached, getVersionCached } from '../../cache/tarball.js';
import { decompressTargz } from '../../packageManage/decompress.js';
import { detectRegistry } from '../../packageManage/detectRegistry.js';
import { downloadIfNot } from '../../packageManage/downloadIfNot.js';
import { packCurrentVersion } from '../../packageManage/package.js';
import { rewritePackage } from '../../packageManage/rewritePackage.js';
import { distTagInput, isDebugMode, registryInput } from '../getArg.js';
import { gitChange, gitInit } from '../git.js';
import { logger } from '../log.js';
import { PackageMetaCache } from '../meta-cache.js';
import { monorepo } from '../mono-tools.js';
import { prepareWorkingFolder } from '../temp-work-folder.js';

interface IResult {
	changedFiles: string[];
	hasChange: boolean;
	remoteVersion?: string;
}
interface IPrivate extends IResult {
	localVersion: string;
}

const resultCacheTtl = 30 * 60;
export const DETECT_CHANGE_METACACHE_KEY = 'detectChange';

export async function executeChangeDetect(packageFile: string, packageJson: IPackageJson): Promise<IResult> {
	const metacache = new PackageMetaCache();
	const meta = await metacache.getCacheData<IPrivate>(packageJson.name, DETECT_CHANGE_METACACHE_KEY, resultCacheTtl);
	const cached = meta.get();
	if (cached && cached.localVersion === packageJson.version) {
		logger.log(
			' -> 使用缓存: %s (change=%s, count=%s)',
			cached.remoteVersion,
			cached.hasChange,
			cached.changedFiles.length
		);
		return cached;
	}

	const r = await execCached(packageFile, packageJson);

	await meta.set({ ...r, localVersion: packageJson.version });

	return r;
}

let detecting: Promise<string>;

async function execCached(packageFile: string, packageJson: IPackageJson): Promise<IResult> {
	const packagePath = resolve(packageFile, '..');

	const p = new PathEnvironment();
	p.add(resolve(packagePath, 'node_modules/.bin'));
	p.add(resolve(process.argv0, '..'));
	for (const l in process.env) {
		if (l.startsWith('LC_')) {
			delete process.env[l];
		}
	}

	logger.log('包名: %s', packageJson.name);

	if (packageJson.private) {
		logger.log('检测到私有包，禁止运行。');
		return { changedFiles: [], hasChange: false };
	}

	if (!detecting) {
		detecting = detectRegistry(registryInput, packagePath);
	}
	const registry = await detecting;

	const remoteVersion = await getVersionCached(packageJson.name, distTagInput, registry);
	logger.log(' -> npm 远程版本 = %s', remoteVersion);
	logger.log(' -> package.json 本地版本 = %s', packageJson.version);

	if (!remoteVersion || gt(packageJson.version, remoteVersion)) {
		logger.log('本地版本 (%s) 已经大于远程版本 (%s)，无需进一步更改。', packageJson.version, remoteVersion);
		return { changedFiles: ['package.json'], hasChange: false, remoteVersion };
	} else {
		logger.log('本地版本 (%s) 小于或等于远程版本 (%s)，尝试检测更改...', packageJson.version, remoteVersion);
	}

	const tempRoot = await monorepo.getTempFolder();
	const workingRoot = resolve(tempRoot, 'package-change/working');
	const tempFolder = await prepareWorkingFolder(workingRoot, packageJson.name, packageJson.version);
	const tempFile = resolve(workingRoot, `${normalizeName(packageJson.name)}-${packageJson.version}.tgz`);

	const tarball = await getTarballCached(packageJson.name, distTagInput, registry);
	if (!tarball) {
		throw new Error(`无法获取 tarball URL: "${packageJson.name}@${distTagInput}" 来自 "${registry}"`);
	}
	await downloadIfNot(tarball!, tempFile);
	await decompressTargz(tempFile, tempFolder);
	await rewritePackage(tempFolder);
	await gitInit(tempFolder);

	const pack = await packCurrentVersion(packagePath);
	logger.log('  --> %s', pack);

	await decompressTargz(pack, tempFolder);
	await rewritePackage(tempFolder);
	const changedFiles = await gitChange(tempFolder);

	if (!isDebugMode) {
		logger.debug('删除临时目录');
		await rm(workingRoot, { force: true, recursive: true });
	} else {
		logger.debug('由于是调试模式，不删除临时文件夹: %s', workingRoot);
	}

	return { changedFiles, hasChange: changedFiles.length > 0, remoteVersion };
}

function normalizeName(name: string) {
	return name.replace(/^@/, '').replaceAll('/', '-');
}
