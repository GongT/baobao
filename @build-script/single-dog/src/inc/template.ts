// @ts-ignore
import { createRequire } from 'module';
import { posix, resolve } from 'path';
import { findUpUntil, lrelative } from '@idlebox/node';
import { convertCatchedError } from '@idlebox/common';
import { readFileSync } from 'fs/promises';

export function getTemplatePath(what: string) {
	return resolve(TEMPLATE_ROOT, what);
}

export function readTemplate(what: string) {
	return readFileSync(resolve(TEMPLATE_ROOT, what), 'utf8');
}

export async function locateRootRelativeToProject(projectFile: string, singleDogFile: string) {
	const resolveFrom = resolve(projectFile, '..');
	const require = createRequire(projectFile);
	try {
		require.resolve('@build-script/single-dog-asset/package.json');
	} catch (e) {
		console.error('------------------');
		console.error(convertCatchedError(e).stack);
		console.error('------------------');
		console.error(`Can't resolve node path for file ${singleDogFile}.\n    From ${resolveFrom}.`);
		console.error('------------------');
		console.error((require as any).paths);
		process.exit(1);
	}
	const resolveTo =
		require.resolve('@build-script/single-dog-asset/package.json').replace(/package\.json$/, '') + singleDogFile;

	const relPath = posix.relative(resolveFrom, resolveTo);
	if (/^((\.\.|\.)[\\/])*node_modules/.test(relPath)) {
		if (!/node_modules\/\.pnpm\//.test(relPath)) {
			return relPath;
		}
	}

	const absRelPath = await findUpUntil(resolveFrom, 'node_modules/@build-script/single-dog-asset/' + singleDogFile);
	if (!absRelPath) {
		throw new Error(`Can't resolve node path for file ${singleDogFile}.\n    From ${resolveFrom}.`);
	}
	return lrelative(resolveFrom, absRelPath);
}
