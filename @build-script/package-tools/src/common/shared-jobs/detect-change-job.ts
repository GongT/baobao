import type { IMyLogger } from '@idlebox/cli';
import { isBuildMode, type CancellationToken, type IPackageJson } from '@idlebox/common';
import { forceDebuggerBreak, PathEnvironment } from '@idlebox/node';
import { resolve } from 'node:path';
import { gt } from 'semver';
import { distTagInput } from '../functions/cli.js';
import { GitWorkingTree } from '../git/git.js';
import { makePackageJsonOrderConsistence } from '../package-manager/package-json.js';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { TempWorkingFolder } from '../temp-work-folder.js';

interface IPackageJsonChange {
	lines: string;
	incompatible: boolean;
}

export interface IChangeDetectResult {
	changedFiles: string[];
	hasChange: boolean;
	remoteVersion?: string;
	packageJsonDiff: IPackageJsonChange;
}

interface IDetectOptions {
	forcePrivate?: boolean;
	readonly cancel?: CancellationToken;
	readonly logger?: IMyLogger;
}

function never(): Promise<void> {
	return new Promise(() => {});
}

export async function executeChangeDetect(pm: IPackageManager, options: IDetectOptions = {}): Promise<IChangeDetectResult> {
	const logger = options.logger ?? pm.logger.extend('change-detect');
	try {
		return await _executeChangeDetect(pm, options, logger, options.cancel?.promise ?? never());
	} catch (error) {
		logger.warn`检测更改时发生错误: ${error}`;

		options.cancel?.throwIfCanceled();
		throw error;
	}
}

async function _executeChangeDetect(pm: IPackageManager, options: IDetectOptions, logger: IMyLogger, background: Promise<void>): Promise<IChangeDetectResult> {
	const r = <T>(p: Promise<T>) => {
		const pp = Promise.race<T>([p, background as Promise<any>]);
		if (isBuildMode) {
			return pp;
		}
		return pp.then((v) => {
			if (v === undefined) {
				console.log(p, background);
				forceDebuggerBreak();
				throw new Error('Promise race returned undefined');
			}
			return v;
		});
	};

	const packageJson = await r(pm.loadPackageJson());

	logger.debug('修改检测 | 包名: %s', packageJson.name);
	if (!packageJson.name) {
		throw new Error(`${pm.projectPath}/package.json 中缺少 name 字段`);
	}

	const cache = await r(pm.createCacheHandler(options));

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
		return { changedFiles: [], hasChange: false, packageJsonDiff: { lines: '', incompatible: false } };
	}

	const remotePackage = await cache.fetchVersion(packageJson.name, distTagInput, undefined, options.cancel);
	logger.debug(' -> npm 远程版本 = %s', remotePackage?.version);
	logger.debug(' -> package.json 本地版本 = %s', packageJson.version);

	if (!remotePackage || gt(packageJson.version, remotePackage.version)) {
		logger.debug('本地版本 (%s) 已经大于远程版本 (%s)，无需进一步检测', packageJson.version, remotePackage?.version);
		return {
			changedFiles: ['package.json'],
			hasChange: false,
			remoteVersion: remotePackage?.version,
			packageJsonDiff: {
				lines: `短路检测: "version" 本地为 ${packageJson.version}, 远程版本为 ${remotePackage?.version}`,
				incompatible: false,
			},
		};
	}
	logger.debug('本地版本 (%s) 小于或等于远程版本 (%s)，尝试检测更改...', packageJson.version, remotePackage.version);

	const tarball = await cache.downloadTarball(packageJson.name, distTagInput, options.cancel);

	const tempFolder = new TempWorkingFolder(pm.workspace, 'package-change-detect', logger);
	options.cancel?.onCancellationRequested(() => tempFolder.dispose());

	const workingRoot = tempFolder.resolve('working');
	await workingRoot.unpack(tarball);
	const oldJson = await r(makePackageJsonOrderConsistence(workingRoot.path));

	const gitrepo = new GitWorkingTree(workingRoot.path, logger, options.cancel?.abort);
	await gitrepo.init();

	const pack = await pm.pack(tempFolder.joinpath('local-pack.tgz'), options);
	logger.verbose('  --> %s', pack);

	await workingRoot.unpack(pack);
	logger.verbose('  unpacked successfully');

	const newJson = await r(makePackageJsonOrderConsistence(workingRoot.path));

	const changedFiles = await gitrepo.commitChanges();
	logger.verbose`  changed files: list<${changedFiles}>`;

	const packageJsonDiff = {
		lines: '',
		incompatible: false,
	};
	if (changedFiles.includes('package.json')) {
		packageJsonDiff.lines = await gitrepo.fileDiff('package.json');
		logger.debug(`    - package.json 文件的修改:\n${packageJsonDiff.lines}`);

		packageJsonDiff.incompatible = hasLargeVersionUpgrade(oldJson, newJson);
		logger.debug(`    - 不兼容升级: ${packageJsonDiff.incompatible}`);
	} else {
		logger.debug(`    - package.json 文件未修改`);
	}

	return { changedFiles, hasChange: changedFiles.length > 0, remoteVersion: remotePackage.version, packageJsonDiff };
}

/**
 * 如何判断需要更新minor版本:
 *
 * 有新增依赖
 * 某个依赖的版本号发生变化（其中patch已经提前删掉，所以变化一定是不兼容的）
 */
function hasLargeVersionUpgrade(from: IPackageJson, to: IPackageJson): boolean {
	for (const [name, newVersion] of Object.entries(to.dependencies || {})) {
		const oldVersion = from.dependencies?.[name];
		if (!oldVersion) {
			return true;
		}
		if (newVersion !== oldVersion) {
			return true;
		}
	}
	return false;
}
