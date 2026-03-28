// @ts-nocheck

import { globSync, type Dirent } from 'node:fs';
import { dirname, relative } from 'node:path';

console.log = console.error;
const excludeFiles = /^autoindex\..*|.*\.(bin|test|devel)\..*$/;
const excludeFolders = /^(test|tests|bin|bins)$/i;

export async function generate(filename: string) {
	console.error(`Generating index code for ${filename}`);

	const dir = dirname(filename);
	const result = [];

	// const exclude = ['**/autoindex.*', '**/test/**', '**/tests/**', '**/test.*'];
	for (const file of globSync(['**/*.ts', '**/*.tsx'], { cwd: dir, exclude, withFileTypes: true })) {
		const absolute = `${file.parentPath}/${file.name}`;
		const rel = relative(dir, absolute);
		console.error(` + ${rel}`);

		result.push(`export * from './${rel}';`);
	}
	result.push('\n\n// Auto-generated, you should never see this file on disk');

	process.stdout.write(result.join('\n'));
}

function exclude(file: Dirent) {
	if (file.isDirectory()) {
		if (excludeFolders.test(file.name)) {
			console.error(` - ${file.name}/`);
			return true;
		}
		return false;
	}

	if (excludeFiles.test(file.name)) {
		console.error(` - ${file.name}`);
		return true;
	}

	return false;
}
