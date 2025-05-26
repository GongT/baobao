import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export function usageString() {
	return '测试参数';
}
export function descriptionString() {
	return '测试命令';
}
export function helpString() {
	return '没有帮助信息';
}
export async function main() {
	const pm = await createPackageManager(PackageManagerUsageKind.Read);
	const cache = await pm.createCacheHandler();

	const r = await cache.downloadTarball('react-dom', 'latest');
	console.log(r);
}
