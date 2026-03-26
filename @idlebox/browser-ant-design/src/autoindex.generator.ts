/// <reference types="node" />

import type { GenerateContext } from '@build-script/codegen';
import { glob } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

export async function generate(context: GenerateContext) {
	const output = context.file('autoindex.ts');
	const dir = resolve(import.meta.dirname);
	for await (const file of glob(['*/**/*.ts', '*/**/*.tsx'], { cwd: dir })) {
		// if (file.includes('_internal/')) {
		// 	continue;
		// }
		if (basename(file).startsWith('_')) {
			continue;
		}

		output.import('*', resolve(dir, file), true);
	}
}
