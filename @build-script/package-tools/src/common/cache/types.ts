import { logger as defaultLogger } from '@idlebox/cli';
import type { CancellationToken, IPackageJson } from '@idlebox/common';

export enum CacheMode {
	Normal = 'normal',
	ForceNew = 'force-renew',
	Offline = 'offline',
}

export interface ICacheHandler {
	readonly path?: string;
	deleteMetadata(name: string): Promise<boolean>;
	deleteAllMetadata(names: readonly string[]): Promise<number>;
	fetchVersion(name: string, distTag?: string, cacheMode?: CacheMode, abort?: CancellationToken): Promise<IPackageJson | undefined>;
	downloadTarball(name: string, distTag: string, abort?: CancellationToken): Promise<string>;
	deleteTarball(name: string, distTag: string): Promise<void>;
}

export abstract class CacheHandlerBase {
	constructor(public readonly logger = defaultLogger) {}
}
