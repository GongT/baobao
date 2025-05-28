import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { execLazyError, exists, writeFileIfChange } from '@idlebox/node';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { NpmCacheHandler } from '../cache/native.npm.js';
import { registryInput } from '../functions/cli.js';
import { logger } from '../functions/log.js';
import { TempWorkingFolder } from '../temp-work-folder.js';
import type { IWorkspace } from '../workspace/workspace.js';
import { DEFAULT_NPM_REGISTRY } from './constant.js';
import { cachedPackageJson } from './package-json.js';

export interface IUploadResult {
	name: string;
	version: string;
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
		public readonly workspace: IWorkspace,
		subdir = process.cwd()
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

	public pack(saveAs: string, packagePath = this.projectPath) {
		logger.log(`打包项目: ${packagePath}`);
		return this._pack(saveAs, packagePath);
	}

	protected abstract _pack(saveAs: string, packagePath: string): Promise<string>;

	async loadPackageJson() {
		return cachedPackageJson(resolve(this.projectPath, 'package.json'));
	}

	async getScope() {
		const pkg = await this.loadPackageJson();
		if (pkg.name.startsWith('@')) {
			const name = pkg.name.split('/')[0];
			return name;
		} else {
			return undefined;
		}
	}

	async getConfig(key: string): Promise<any> {
		const pkgPublishConfig = this.workspace.getNpmRCPath('.npmrc-publish');
		if (this.usageKind === PackageManagerUsageKind.Read || !(await exists(pkgPublishConfig))) {
			return this._get_config(dirname(this.workspace.getNpmRCPath('.npmrc')), key);
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
			const content = await this._execGetOut(cwd, ['config', 'get', `${scope}:${key}`]);
			logger.debug('$ npm config get %s:%s -> %s', scope, key, content);
			if (content !== 'undefined') {
				return content;
			}
		}
		const content = await this._execGetOut(cwd, ['config', 'get', key]);
		logger.debug('$ npm config get %s -> %s', key, content);
		return content === 'undefined' ? undefined : content;
	}

	protected abstract _uploadTarball(pack: string, cwd: string): Promise<IUploadResult | undefined>;
	public async uploadTarball(pack: string, cwd: string = this.projectPath) {
		logger.debug(`上传压缩包: ${pack}`);
		try {
			const r = await this._uploadTarball(pack, cwd);
			if (r) {
				logger.log('    发布成功: %s @ %s', r.name, r.version);
				return r;
			} else {
				logger.log('    ! 覆盖已有版本');
				return r;
			}
		} catch (e) {
			logger.log('    发布失败!');
			throw e;
		}
	}

	protected async _execGetOut(cwd: string, cmds: string[]): Promise<string> {
		const result = await execLazyError(this.binary, cmds, { cwd, stdout: 'pipe' });
		return result.stdout.trim();
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
