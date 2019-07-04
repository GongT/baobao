import { readFileSync } from 'fs-extra';
import { dirname, posix, resolve } from 'path';

export function readTemplate(what: string) {
	return readFileSync(resolve(TEMPLATE_ROOT, what), 'utf8');
}

export function locateTemplate(file: string) {
	return locateRoot('package/' + file);
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

export function locateRootRelativeToProject(projectFile: string, singleDogFile: string) {
	return posix.relative(resolve(CONTENT_ROOT, projectFile, '..'), locateRoot(singleDogFile));
}

export function locateTemplateRelativeTo(file: string, folder: string) {
	return posix.relative(posix.normalize(folder), locateTemplate(file));
}
