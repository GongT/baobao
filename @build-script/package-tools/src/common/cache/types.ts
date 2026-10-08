export enum CacheMode {
	Normal = 'normal',
	ForceNew = 'force-renew',
	Offline = 'offline',
}
import type { CancellationToken, IPackageJson } from '@idlebox/common';
import type { IRegistryMetadata } from './native.npm.js';

export interface ICacheHandler {
	readonly path?: string;
	deleteMetadata(name: string): Promise<boolean>;
	deleteAllMetadata(names: readonly string[]): Promise<number>;
	fetchMetadata(name: string, cacheMode?: CacheMode, abort?: CancellationToken): Promise<IRegistryMetadata | undefined>;
	fetchVersion(name: string, distTag?: string, cacheMode?: CacheMode, abort?: CancellationToken): Promise<IPackageJson | undefined>;
	downloadTarball(name: string, distTag: string, abort?: CancellationToken): Promise<string>;
	deleteTarball(name: string, distTag: string): Promise<void>;
}
