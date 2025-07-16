import { NotImplementedError } from '@idlebox/common';
import { readCommentJsonFile } from '@idlebox/json-edit';
import { resolve } from 'node:path';
import { PackageManagerKind } from '../common/types.js';

export function rushListProjects(_projectRoot: string): never {
	throw new NotImplementedError('rush is not not implemented.');
}

/**
 * @private
 */
export async function getRushPackageManager(projectRoot: string) {
	const settings = await readCommentJsonFile(resolve(projectRoot, 'rush.json'));
	if (settings.pnpmVersion) {
		return PackageManagerKind.PNPM;
	}
	if (settings.yarnVersion) {
		return PackageManagerKind.YARN;
	}
	if (settings.npmVersion) {
		return PackageManagerKind.NPM;
	}
	throw new Error('rush设置不正常，缺少包管理器版本信息');
}
