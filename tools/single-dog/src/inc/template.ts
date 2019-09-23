import { findUpUntil, lrelative } from '@idlebox/platform';
import { readFileSync } from 'fs-extra';
// @ts-ignore
import { createRequire } from 'module';
import { posix, resolve } from 'path';

export function readTemplate(what: string) {
	return readFileSync(resolve(TEMPLATE_ROOT, what), 'utf8');
}

export async function locateRootRelativeToProject(projectFile: string, singleDogFile: string) {
	const require = createRequire(resolve(CONTENT_ROOT, projectFile));
	const resolveFrom = resolve(CONTENT_ROOT, projectFile, '..');
	const resolveTo = require.resolve('@idlebox/single-dog-asset/' + singleDogFile);

	const relPath = posix.relative(resolveFrom, resolveTo);
	if (/^((\.\.|\.)[\\/])*node_modules/.test(relPath)) {
		return relPath;
	}

	const absRelPath = await findUpUntil(resolveFrom, 'node_modules/@idlebox/single-dog-asset/' + singleDogFile);
	if (!absRelPath) {
		throw new Error(`Can't resolve node path for file ${singleDogFile}.\n    From ${resolveFrom}.`);
	}
	return lrelative(resolveFrom, absRelPath);
}
