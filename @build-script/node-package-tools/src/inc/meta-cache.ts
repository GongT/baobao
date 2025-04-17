import { createJsonFile, loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { findNpmCachePath } from '../cache/native.npm.js';
import { escapeName } from './fs.js';

interface Generic {
	[key: string]: ICacheField<any>;
}
interface ICacheField<T> {
	value?: T;
	time: number;
}
function getWithExpire<T>(object: undefined | ICacheField<T>, ttlSeconds: number): T | undefined {
	if (!object) return;
	if (object.time + ttlSeconds * 1000 < Date.now()) {
		return;
	}
	return object.value;
}

type Memo = Map<string, Promise<any>>;

export class PackageMetaCache {
	private memo: Memo = new Map();

	constructor(public readonly cachePath = resolve(findNpmCachePath(), '../node-package-tools')) {}

	private async getCacheFile(name: string): Promise<Generic> {
		const exists = this.memo.get(name);
		if (exists) {
			return exists;
		}
		const file = resolve(this.cachePath, escapeName(name) + '.json');
		const p = loadJsonFileIfExists(file);
		this.memo.set(
			name,
			p.then((r) => {
				if (!r) {
					r = {};
					createJsonFile(r, file);
				}
				return r;
			})
		);
		return p;
	}

	public async getCacheData<T>(name: string, field: string, ttl = -1): Promise<MetaOperator<T>> {
		const data = await this.getCacheFile(name);
		if (!data[field]) {
			data[field] = { time: 0 };
		}
		return new MetaOperator(data, data[field], ttl);
	}
}

class MetaOperator<T> {
	constructor(
		private readonly fileRef: any,
		private readonly data: ICacheField<T>,
		private readonly defaultTtl: number
	) {}

	public async set(value: T): Promise<void> {
		this.data.value = value;
		const d = new Date();
		this.data.time = d.getTime();
		Object.assign(this.data, { '#time': d.toISOString() });
		await writeJsonFileBack(this.fileRef);
	}

	public get(ttlSec: number = this.defaultTtl) {
		if (ttlSec < 0) {
			throw new Error('ttlSec must be greater than 0');
		}
		return getWithExpire(this.data, ttlSec);
	}

	public async delete() {
		this.data.value = undefined;
		this.data.time = 0;
		delete (this.data as any)['#time'];
		await writeJsonFileBack(this.fileRef);
	}
}
