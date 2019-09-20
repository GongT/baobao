import { findUpUntil, lrelative } from '@idlebox/platform';
import { readFileSync } from 'fs-extra';
import { dirname, posix, resolve } from 'path';

export function readTemplate(what: string) {
	return readFileSync(resolve(TEMPLATE_ROOT, what), 'utf8');
}

export function locateRoot(file: string) {
	let root = '';
	try {
		root = dirname(require.resolve('@gongt/single-dog/package.json'));
	} catch (e) {
		if (/Cannot find module/.test(e.message)) {
			root = dirname(dirname(__dirname));
		} else {
			throw e;
		}
	}
	return resolve(root, file).replace(/\\/g, '/');
}

export async function locateRootRelativeToProject(projectFile: string, singleDogFile: string) {
	const resolveFrom = resolve(CONTENT_ROOT, projectFile, '..');
	const resolveTo = locateRoot(singleDogFile);

	const relPath = posix.relative(resolveFrom, resolveTo);
	if (relPath.includes('/node_modules/')) {
		return relPath;
	}

	const absRelPath = await findUpUntil(resolveFrom, 'node_modules/@gongt/single-dog/' + singleDogFile);
	if (!absRelPath) {
		throw new Error(`Can't resolve node path for file ${singleDogFile}.\n    From ${resolveFrom}.`);
	}
	return lrelative(resolveFrom, absRelPath);
}
