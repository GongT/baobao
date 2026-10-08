import { NpmCacheHandler } from '../cache/native.npm.js';
import { PackageManager, type IPackManExec, type IUploadResult } from './driver.abstract.js';

export class NPM extends PackageManager {
	override binary = 'npm';

	override async _pack(_saveAs: string): Promise<string> {
		throw new Error('Method not implemented.');
	}

	override async _uploadTarball(_pack: string, _cwd: string): Promise<IUploadResult> {
		throw new Error('Method not implemented.');
	}

	private _cache_handler?: NpmCacheHandler;
	override async createCacheHandler(options: IPackManExec = {}) {
		if (!this._cache_handler) {
			const registry = await this.getNpmRegistry(options);

			const path = await this.getConfig('cache', options);
			if (!path) throw new Error('npm config get cache返回为空');

			this._cache_handler = new NpmCacheHandler(this, registry, path, this.logger);
		}
		return this._cache_handler;
	}
}
