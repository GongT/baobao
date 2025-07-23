import { logger } from '@idlebox/logger';
import { PathEnvironment } from '@idlebox/node';
import { resolve } from 'node:path';
import { gt } from 'semver';
import { distTagInput } from '../functions/cli.js';
import { GitWorkingTree } from '../git/git.js';
import { makePackageJsonOrderConsistence } from '../package-manager/package-json.js';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { TempWorkingFolder } from '../temp-work-folder.js';

interface IResult {
	changedFiles: string[];
	hasChange: boolean;
	remoteVersion?: string;
}

interface IDetectOptions {
	forcePrivate?: boolean;
}

export async function executeChangeDetect(pm: IPackageManager, options: IDetectOptions): Promise<IResult> {
	const packageJson = await pm.loadPackageJson();
	logger.debug('修改检测 | 包名: %s', packageJson.name);
	if (!packageJson.name) {
		throw new Error(`${pm.projectPath}/package.json 中缺少 name 字段`);
	}

	const cache = await pm.createCacheHandler();

	const p = new PathEnvironment();
	p.add(resolve(pm.projectPath, 'node_modules/.bin'));
	p.add(resolve(process.argv0, '..'));
	for (const l in process.env) {
		if (l.startsWith('LC_')) {
			delete process.env[l];
		}
	}

	if (packageJson.private && !options.forcePrivate) {
		logger.debug('检测到私有包，禁止运行');
		return { changedFiles: [], hasChange: false };
	}

	const remotePackage = await cache.fetchVersion(packageJson.name, distTagInput);
	logger.debug(' -> npm 远程版本 = %s', remotePackage?.version);
	logger.debug(' -> package.json 本地版本 = %s', packageJson.version);

	if (!remotePackage || gt(packageJson.version, remotePackage.version)) {
		logger.debug('本地版本 (%s) 已经大于远程版本 (%s)，无需进一步检测', packageJson.version, remotePackage?.version);
		return { changedFiles: ['package.json'], hasChange: false, remoteVersion: remotePackage?.version };
	}
	logger.debug('本地版本 (%s) 小于或等于远程版本 (%s)，尝试检测更改...', packageJson.version, remotePackage.version);

	const tarball = await cache.downloadTarball(packageJson.name, distTagInput);

	const tempFolder = new TempWorkingFolder(pm.workspace, 'package-change-detect');
	const workingRoot = tempFolder.resolve('working');
	await workingRoot.unpack(tarball);
	await makePackageJsonOrderConsistence(workingRoot.path);

	const gitrepo = new GitWorkingTree(workingRoot.path);
	await gitrepo.init();

	const pack = await pm.pack(tempFolder.joinpath('local-pack.tgz'));
	logger.verbose('  --> %s', pack);

	await workingRoot.unpack(pack);
	logger.verbose('  unpacked successfully');

	await makePackageJsonOrderConsistence(workingRoot.path);

	const changedFiles = await gitrepo.commitChanges();
	logger.verbose`  changed files: list<${changedFiles}>`;

	return { changedFiles, hasChange: changedFiles.length > 0, remoteVersion: remotePackage.version };
}
