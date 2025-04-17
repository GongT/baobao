import type { IPackageJson } from '@idlebox/common';
import { writeJsonFileBack } from '@idlebox/node-json-edit';
import { inc } from 'semver';
import { logger } from '../inc/log.js';

export async function increaseVersion(pkg: IPackageJson, current: string) {
	const v = inc(current, 'patch');
	if (!v) {
		throw new Error(`无法为"${pkg.name}"当前版本"${current}"增加版本号`);
	}
	pkg.version = v;
	logger.log('新版本: %s', pkg.version);
	const ch = await writeJsonFileBack(pkg);
	logger.debug('package.json回写: %s', ch);
}
