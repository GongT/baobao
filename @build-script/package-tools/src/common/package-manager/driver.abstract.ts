import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { logger } from '@idlebox/logger';
import { execLazyError, exists, writeFileIfChange } from '@idlebox/node';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { NpmCacheHandler } from '../cache/native.npm.js';
import { registryInput } from '../functions/cli.js';
import { TempWorkingFolder } from '../temp-work-folder.js';
import { DEFAULT_NPM_REGISTRY } from './constant.js';
import { cachedPackageJson } from './package-json.js';

export interface IUploadResult {
	name: string;
	version: string;
	published: boolean;
}

export enum PackageManagerUsageKind {
	Read = 0,
	Write = 1,
}

export abstract class PackageManager {
	abstract readonly binary: string;
	public readonly projectPath: string;
	private readonly configTemp;

	constructor(
		public readonly usageKind: PackageManagerUsageKind,
		public readonly workspace: WorkspaceBase,
		subdir = process.cwd(),
	) {
		this.configTemp = new TempWorkingFolder(this.workspace, 'package-manager', true);
		this.projectPath = resolve(workspace.root, subdir);
		if (!this.projectPath.startsWith(workspace.root)) {
			throw new Error(`project "${this.projectPath}" is outside the workspace root`);
		}
	}

	public install() {
		return execa(this.binary, ['install'], { cwd: this.projectPath, stdio: 'inherit' });
	}

	public async pack(saveAs: string) {
		logger.verbose`打包项目: long<${this.projectPath}> -> long<${saveAs}>`;

		const pkg = await this.loadPackageJson();
		if (pkg.publishConfig?.['packCommand']) {
			const cmds = typeof pkg.publishConfig['packCommand'] === 'string' ? splitCmd(pkg.publishConfig['packCommand']) : pkg.publishConfig['packCommand'];

			if (!Array.isArray(cmds)) {
				logger.fatal`publishConfig.packCommand必须是字符串或字符串数组, 但实际是: ${typeof pkg.publishConfig['packCommand']}`;
			}

			logger.debug`使用自定义打包命令: ${cmds[0]}...`;

			const [cmd, ...args] = cmds;
			await execLazyError(cmd, [...args, '--out', saveAs], {
				cwd: this.projectPath,
			});
			return saveAs;
		} else {
			return this._pack(saveAs);
		}
	}

	protected abstract _pack(saveAs: string): Promise<string>;

	async loadPackageJson() {
		return cachedPackageJson(resolve(this.projectPath, 'package.json'));
	}

	async getScope() {
		const pkg = await this.loadPackageJson();
		if (pkg.name?.startsWith('@')) {
			const name = pkg.name.split('/')[0];
			return name;
		} else {
			return undefined;
		}
	}

	async getConfig(key: string): Promise<any> {
		const pkgPublishConfig = this.workspace.getNpmRCPath(true);
		if (this.usageKind === PackageManagerUsageKind.Read || !(await exists(pkgPublishConfig))) {
			return this._get_config(dirname(this.workspace.getNpmRCPath(false)), key);
		}

		if (!this.configTemp.exists) {
			await this.configTemp.mkdir();
			await ensureLinkTarget(pkgPublishConfig, `${this.configTemp.path}/.npmrc`);
			await writeFileIfChange(`${this.configTemp.path}/package.json`, '{}');
		}

		return this._get_config(this.configTemp.path, key);
	}

	private async _get_config(cwd: string, key: string) {
		const scope = await this.getScope();
		if (scope) {
			const { stdout } = await this._execGetOut(cwd, ['config', 'get', `${scope}:${key}`]);
			logger.debug('$ npm config get %s:%s -> %s', scope, key, stdout);
			if (`${stdout}` !== 'undefined') {
				return stdout;
			}
		}
		const { stdout } = await this._execGetOut(cwd, ['config', 'get', key]);
		logger.debug('$ npm config get %s -> %s', key, stdout);
		return stdout === 'undefined' ? undefined : stdout;
	}

	protected abstract _uploadTarball(pack: string, cwd: string): Promise<IUploadResult>;
	public async uploadTarball(pack: string, cwd: string = this.projectPath) {
		logger.debug(`上传压缩包: ${pack}`);
		try {
			const r = await this._uploadTarball(pack, cwd);
			logger.debug`    发布成功: ${r.name} @ ${r.version} [${r.published}]`;
			return r;
		} catch (e: any) {
			logger.debug`    tarball发布失败`;
			throw e;
		}
	}

	protected async _execGetOut(cwd: string, cmds: string[], reject = true) {
		const result = await execa(this.binary, cmds, {
			stdio: ['ignore', 'pipe', 'pipe'],
			cwd: cwd,
			reject: reject,
			stripFinalNewline: true,
			encoding: 'utf8',
			all: true,
		});

		return {
			get stdout() {
				return result.stdout.trim();
			},
			get stderr() {
				return result.stderr.trim();
			},
			get all() {
				return result.all.trim();
			},
		};
	}

	private _cachedReg?: string;
	public async getNpmRegistry() {
		if (!this._cachedReg) {
			switch (registryInput) {
				case 'detect':
					logger.debug(`检测registry地址: ${registryInput}`);
					this._cachedReg = await this.getConfig('registry');
					break;
				default:
					if (!registryInput.startsWith('https://')) {
						throw new Error(`不支持的--registry协议: ${registryInput}`);
					}
					logger.debug('使用命令行提供的registry地址 (%s)', registryInput);
					this._cachedReg = registryInput;
			}
		}
		return this._cachedReg || DEFAULT_NPM_REGISTRY;
	}

	private _cache_handler?: NpmCacheHandler;
	async createCacheHandler() {
		if (!this._cache_handler) {
			const registry = await this.getNpmRegistry();

			const path = await this.getConfig('cache');
			if (!path) throw new Error('npm config get cache返回为空');

			this._cache_handler = new NpmCacheHandler(this, registry, resolve(path, '_cacache'));
		}
		return this._cache_handler;
	}
}
