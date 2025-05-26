import { pDesc } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { cnpmSync } from '../common/shared-jobs/cnpm-sync.js';

export function usageString() {
	return '';
}
export function descriptionString() {
	return '调用cnpm sync命令';
}
export function helpString() {
	return pDesc('需要在PATH中存在cnpm命令');
}

export async function main() {
	const packageManager = await createPackageManager(PackageManagerUsageKind.Read);
	const list = await packageManager.workspace.listPackages();

	await cnpmSync(list);
}
