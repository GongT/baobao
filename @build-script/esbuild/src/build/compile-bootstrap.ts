import ts from 'typescript';

import { Emitter } from '@idlebox/common';
import { FSWatcher } from 'chokidar';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hash } from './esbuild/library.js';
import { entrySourceRoot, outputDir } from './library/constants.js';

const event = new Emitter<string | Error>();

export function transpileBootstrap(watchMode: boolean) {
	const bsFile = resolve(entrySourceRoot, 'bootstrap.ts');

	if (watchMode) {
		const watchers = new FSWatcher({ cwd: entrySourceRoot });

		watchers.add(bsFile);

		watchers.on('change', (f) => {
			console.log('[ts] change detect: %s', f);

			build(bsFile);
		});
	}
	build(bsFile);

	return event.register;
}

async function build(file: string) {
	try {
		const bsInput = await readFile(file, 'utf-8');

		const result = ts.transpileModule(bsInput, {
			compilerOptions: {
				target: ts.ScriptTarget.ES5,
				module: ts.ModuleKind.None,
				sourceMap: true,
				inlineSources: true,
			},
			fileName: file,
			reportDiagnostics: true,
		});

		const name = `bootstrap-${hash(result.outputText)}.js`;
		const output = resolve(outputDir, name);
		await writeFile(output, result.outputText, 'utf-8');
		await writeFile(`${output}.map`, result.sourceMapText!, 'utf-8');

		event.fire(name);
	} catch (e: any) {
		event.fireNoError(e);
	}
}
