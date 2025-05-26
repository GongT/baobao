import { logger } from '../common/functions/log.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export function usageString() {
	return '';
}
export function descriptionString() {
	return '从npm缓存中删除关于本monorepo的数据，以便安装最新版本';
}
export function helpString() {
	return '';
}

export async function main() {
	const packageManager = await createPackageManager(PackageManagerUsageKind.Read);
	const cache = await packageManager.createCacheHandler();

	const list = await packageManager.workspace.listPackages();

	logger.log('删除%d个项目在 %s 的npm缓存', list.length, cache.path);
	for (const data of list) {
		await cache.deleteMetadata(data.packageJson.name);
	}
}
