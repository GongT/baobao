import type { IMyLogger } from '@idlebox/cli';
import type { CancellationToken, IPackageJson } from '@idlebox/common';
import { execa } from 'execa';
import { basename } from 'node:path';
import { PackageManagerUsageKind } from '../package-manager/driver.abstract.js';
import { NPM } from '../package-manager/driver.npm.js';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { CacheHandlerBase, type CacheMode, type ICacheHandler } from './types.js';

export class PnpmCacheHandler extends CacheHandlerBase implements ICacheHandler {
	constructor(
		private readonly pm: IPackageManager,
		public readonly path: string,
		logger?: IMyLogger,
	) {
		super(logger);
	}

	private async exec(commands: readonly string[], check = true, abort?: CancellationToken): Promise<string> {
		const p = execa(commands[0], commands.slice(1), {
			stdout: 'pipe',
			stderr: 'pipe',
			stdin: 'ignore',
			encoding: 'utf8',
			reject: false,
			cancelSignal: abort?.abort,
		});

		const r = await p;
		if (check && r.exitCode !== 0) {
			// throw new Error(`命令执行失败: ${commands.join(' ')}\n${r.stderr}`);
			this.logger.error`命令执行失败: commandline<${commands}>`;
			this.logger.error`long<${r.stderr}>`;
			throw r;
		}

		return r.stdout;
	}

	async deleteMetadata(name: string): Promise<boolean> {
		const v = await this.exec([this.pm.binary, 'cache', 'view', name]);
		const cacheInfo = JSON.stringify(v);
		if (Object.keys(cacheInfo).length === 0) {
			this.logger.debug`缓存不存在: ${name}`;
			return false;
		}

		this.logger.debug`删除pnpm缓存: ${this.pm.binary} cache delete ${name}`;
		await this.exec([this.pm.binary, 'cache', 'delete', name]);
		return true;
	}

	async deleteAllMetadata(names: readonly string[]): Promise<number> {
		const list_str = await this.exec([this.pm.binary, 'cache', 'list', ...names]);
		const list = list_str
			.split('\n')
			.map(cut_name)
			.filter((line) => line.length > 0);

		this.logger.debug`删除pnpm缓存: ${this.pm.binary} cache delete list<${list}>`;
		await this.exec([this.pm.binary, 'cache', 'delete', ...names]);

		return list.length;
	}

	async fetchVersion(name: string, distTag?: string, _cacheMode?: CacheMode, abort?: CancellationToken): Promise<IPackageJson | undefined> {
		let nameTag = name;
		if (distTag) {
			nameTag += `@${distTag}`;
		}
		const v = await this.exec([this.pm.binary, 'view', '--json', nameTag], true, abort);
		return JSON.parse(v);
	}

	async downloadTarball(name: string, distTag: string, abort?: CancellationToken): Promise<string> {
		const npm = await this.fallback();
		const cache = await npm.createCacheHandler({ cancel: abort });
		return await cache.downloadTarball(name, distTag, abort);
	}
	async deleteTarball(name: string, distTag: string, abort?: CancellationToken): Promise<void> {
		const npm = await this.fallback();
		const cache = await npm.createCacheHandler({ cancel: abort });
		await cache.deleteTarball(name, distTag);
	}

	private _npm?: NPM;
	private async fallback() {
		if (this._npm) return this._npm;
		const npm = new NPM(PackageManagerUsageKind.Read, this.pm.workspace, this.pm.projectPath, this.logger);
		this._npm = npm;
		return npm;
	}
}

// registry.npmmirror.com/@babel/core.jsonl --> @babel/core
const regWithScope = /\/?(@[^/]+\/[^/]+)\.jsonl$/;
function cut_name(full_id: string) {
	if (!full_id.trim()) return '';
	if (!full_id.endsWith('.jsonl')) throw new Error(`pnpm cache list 返回的id不符合预期: ${full_id}`);

	const match = full_id.match(regWithScope);
	if (match) return match[1];

	return basename(full_id, '.jsonl');
}
