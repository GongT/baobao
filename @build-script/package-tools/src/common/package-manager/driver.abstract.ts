import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { app, logger as defaultLogger, type IMyLogger } from '@idlebox/cli';
import type { CancellationToken } from '@idlebox/common';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { exists, patchExecaResult, writeFileIfChange } from '@idlebox/node';
import { execa, type ResultPromise } from 'execa';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
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

export interface IPackManExec {
	readonly cancel?: CancellationToken;
}

type IExecGetOutOpt = {
	cwd: string;
	cmds: string[];
	reject?: boolean;
	binary?: string;
	options: IPackManExec;
};

export abstract class PackageManager {
	abstract readonly binary: string;
	public readonly projectPath: string;
	private readonly configTemp;

	constructor(
		public readonly usageKind: PackageManagerUsageKind,
		public readonly workspace: WorkspaceBase,
		subdir = process.cwd(),
		public readonly logger: IMyLogger = defaultLogger,
	) {
		this.configTemp = new TempWorkingFolder(this.workspace, 'package-manager', logger, true);
		this.projectPath = resolve(workspace.root, subdir);
		if (!this.projectPath.startsWith(workspace.root)) {
			throw new Error(`project "${this.projectPath}" is outside the workspace root`);
		}
	}

	public install(options: IPackManExec = {}) {
		return execa(this.binary, ['install'], { cwd: this.projectPath, stdio: 'inherit', cancelSignal: options.cancel?.abort });
	}

	public async pack(saveAs: string, options: IPackManExec = {}) {
		const pkg = await this.loadPackageJson();
		this.logger.log`打包项目 (${pkg.publishConfig?.['packCommand'] ? 'custom' : 'default'}): relative<${this.projectPath}> -> relative<${saveAs}>`;
		if (pkg.publishConfig?.['packCommand']) {
			const cmds = typeof pkg.publishConfig['packCommand'] === 'string' ? splitCmd(pkg.publishConfig['packCommand']) : pkg.publishConfig['packCommand'];

			if (!Array.isArray(cmds)) {
				this.logger.fatal`publishConfig.packCommand必须是字符串或字符串数组, 但实际是: ${typeof pkg.publishConfig['packCommand']}`;
			}

			this.logger.verbose` - 自定义打包命令: ${Array.from(cmds)}`;

			const [cmd, ...args] = cmds;
			await this._exec({ cwd: this.projectPath, cmds: [cmd, ...args, '--out', saveAs], options });
			return saveAs;
		} else {
			return this._pack(saveAs, options);
		}
	}

	protected abstract _pack(saveAs: string, options: IPackManExec): Promise<string>;

	async loadPackageJson() {
		return cachedPackageJson(resolve(this.projectPath, 'package.json'));
	}

	async getScope() {
		let pkg;
		try {
			pkg = await this.loadPackageJson();
		} catch {
			return undefined;
		}
		if (pkg.name?.startsWith('@')) {
			const name = pkg.name.split('/')[0];
			return name;
		} else {
			return undefined;
		}
	}

	async getConfig(key: string, options: IPackManExec = {}): Promise<any> {
		const pkgPublishConfig = this.workspace.getNpmRCPath(true);
		if (this.usageKind === PackageManagerUsageKind.Read || !(await exists(pkgPublishConfig))) {
			return this._get_config(dirname(this.workspace.getNpmRCPath(false)), key, options);
		}

		if (!this.configTemp.exists) {
			await this.configTemp.mkdir();
			await ensureLinkTarget(pkgPublishConfig, `${this.configTemp.path}/.npmrc`);
			await writeFileIfChange(`${this.configTemp.path}/package.json`, '{}');
		}

		return this._get_config(this.configTemp.path, key, options);
	}

	private async _get_config(cwd: string, key: string, options: IPackManExec) {
		let binary = this.binary;
		if (key === 'cache') {
			binary = 'npm';
		}

		const scope = await this.getScope();
		if (scope) {
			const { stdout } = await this._execGetOut({ cwd, cmds: ['config', 'get', `${scope}:${key}`], reject: true, binary, options });
			this.logger.debug('$ %s config get %s:%s -> %s (cwd: %s)', binary, scope, key, stdout, cwd);
			if (`${stdout}` !== 'undefined') {
				return stdout;
			}
		}
		const { stdout } = await this._execGetOut({ cwd, cmds: ['config', 'get', key], reject: true, binary, options });
		this.logger.debug('$ %s config get %s -> %s (cwd: %s)', binary, key, stdout, cwd);
		return stdout === 'undefined' ? undefined : stdout;
	}

	protected abstract _uploadTarball(pack: string, cwd: string, options: IPackManExec): Promise<IUploadResult>;
	public async uploadTarball(pack: string, cwd: string = this.projectPath, options: IPackManExec = {}) {
		this.logger.debug(`上传压缩包: ${pack}`);
		try {
			const r = await this._uploadTarball(pack, cwd, options);
			this.logger.debug`    发布成功: ${r.name} @ ${r.version} [${r.published}]`;
			return r;
		} catch (e: any) {
			this.logger.debug`    tarball发布失败`;
			throw e;
		}
	}

	private buildOption({ cwd, reject, options }: IExecGetOutOpt) {
		return {
			stdio: ['ignore', 'pipe', 'pipe'],
			cwd: cwd,
			reject: reject ?? true,
			stripFinalNewline: true,
			encoding: 'utf8',
			all: true,
			cancelSignal: options.cancel?.abort,
			verbose: app.verbose ? 'short' : 'none',
			env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
		} as const;
	}

	protected _exec(options: IExecGetOutOpt): ResultPromise<ReturnType<typeof this.buildOption>> {
		return patchExecaResult(execa(options.binary || this.binary, options.cmds, this.buildOption(options)));
	}

	protected async _execGetOut(options: IExecGetOutOpt) {
		const result = await this._exec(options);

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
	public async getNpmRegistry(options: IPackManExec = {}) {
		if (!this._cachedReg) {
			switch (registryInput) {
				case 'detect':
					this.logger.debug(`检测registry地址: ${registryInput}`);
					this._cachedReg = await this.getConfig('registry', options);
					break;
				default:
					if (!registryInput.startsWith('https://')) {
						throw new Error(`不支持的--registry协议: ${registryInput}`);
					}
					this.logger.debug('使用命令行提供的registry地址 (%s)', registryInput);
					this._cachedReg = registryInput;
			}
		}
		return this._cachedReg || DEFAULT_NPM_REGISTRY;
	}

	private _cache_handler?: NpmCacheHandler;
	async createCacheHandler(options: IPackManExec = {}) {
		if (!this._cache_handler) {
			const registry = await this.getNpmRegistry(options);

			const path = await this.getConfig('cache', options);
			if (!path) throw new Error('npm config get cache返回为空');

			this._cache_handler = new NpmCacheHandler(this, registry, path, this.logger);
		}
		return this._cache_handler;
	}
}
