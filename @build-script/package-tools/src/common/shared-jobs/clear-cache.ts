import { logger } from '@idlebox/logger';
import { type PackageManager } from '../package-manager/driver.abstract.js';

export async function clearNpmMetaCache(pm: PackageManager, names: readonly string[]) {
	logger.debug('刷新npm缓存...');
	try {
		const cache = await pm.createCacheHandler();
		for (const name of names) {
			await cache.deleteMetadata(name);
		}
	} catch (e) {
		logger.warn`failed flush npm cache: ${e}`;
	}
}
