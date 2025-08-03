import { NotImplementedError } from '@idlebox/common';
import { readCommentJsonFile } from '@idlebox/json-edit';
import { resolve } from 'node:path';
import { PackageManagerKind } from '../common/types.js';

export function lernaListProjects(_projectRoot: string): never {
	throw new NotImplementedError('lerna is not not implemented yet.');
}

export function nxListProjects(_projectRoot: string): never {
	throw new NotImplementedError('nx is not not implemented yet.');
}

/**
 * @private
 */
export async function getLernaPackageManager(projectRoot: string): Promise<PackageManagerKind> {
	const settings = await readCommentJsonFile(resolve(projectRoot, 'lerna.json'));
	if (settings.npmClient === PackageManagerKind.NPM || settings.npmClient === PackageManagerKind.YARN || settings.npmClient === PackageManagerKind.PNPM) {
		return settings.npmClient;
	}
	throw new Error('lerna.json is invalid, npmClient field is unknown');
}
