import { dirname, resolve } from 'path';
import { CompilerOptions } from 'typescript';
import { CONFIG_FILE, DTS_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from './argParse';
import { relativePosix } from './paths';
import { loadJsonFile, writeJsonFileBack, writeJsonFileIfChanged } from '@idlebox/node-json-edit';
import { ensureDir } from 'fs-extra';

export async function rewriteProjectDtsJson() {
	const json = await loadJsonFile(CONFIG_FILE);
	if (!json.compilerOptions) {
		json.compilerOptions = {};
	}
	json.compilerOptions.declaration = false;
	json.compilerOptions.declarationMap = false;
	await writeJsonFileBack(json);
}

export async function writeDtsJson() {
	await ensureDir(dirname(DTS_CONFIG_FILE));
	await writeJsonFileIfChanged(DTS_CONFIG_FILE, {
		extends: relativePosix(EXPORT_TEMP_PATH, CONFIG_FILE),
		compilerOptions: {
			removeComments: false,
			declaration: true,
			declarationMap: true,
			module: 'amd',
			noEmit: false,
			emitDeclarationOnly: true,
			noEmitOnError: false,
			outDir: 'declare-output',
			rootDir: 'extracted-source',
			allowUnusedLabels: true,
			noUnusedLocals: false,
			strict: false,
			alwaysStrict: false,
			stripInternal: true,
		},
		exclude: ['_export_all_in_once_index.ts'],
		include: ['extracted-source/**/*.ts', 'extracted-source/**/*.json'],
		files: [],
	});

	return relativePosix(PROJECT_ROOT, DTS_CONFIG_FILE);
}

export function getOutputFilePath(relativeTo: string, options: CompilerOptions) {
	const { outDir, outFile, baseUrl } = options;

	const targetDir = outDir || dirname(outFile + '') || baseUrl;
	if (!targetDir) {
		throw new Error('Please compile to other directory, do not compile in place.');
	}
	console.log(relativeTo, resolve(targetDir, '_export_all_in_once_index'));
	return relativePosix(relativeTo, resolve(targetDir, '_export_all_in_once_index'));
}
