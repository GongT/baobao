// @ts-nocheck

import type { Dirent } from 'node:fs';
import { glob } from 'node:fs/promises';
import { dirname, relative } from 'node:path';

console.log = console.error;
const excludeFiles = /^autoindex\..*|.*\.(bin|test|devel)\..*$/;
const excludeFolders = /^(test|tests|bin|bins)$/i;

export async function generate(filename: string) {
	console.error(`Generating autoindex for ${filename}`);

	const dir = dirname(filename);
	const result = [];

	// const exclude = ['**/autoindex.*', '**/test/**', '**/tests/**', '**/test.*'];
	for await (const file of glob(['**/*.ts', '**/*.tsx'], { cwd: dir, exclude, withFileTypes: true })) {
		const absolute = `${file.parentPath}/${file.name}`;
		const rel = relative(dir, absolute);
		console.error(` + ${rel}`);

		result.push(`export * from './${rel}';`);
	}

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
