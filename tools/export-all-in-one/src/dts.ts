import { dirname, resolve } from 'path';
import { CompilerOptions } from 'typescript';
import { CONFIG_FILE, DTS_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from './argParse';
import { relativePosix } from './paths';
import { readJsonSync, writeJsonSyncIfChange } from './writeFile';

export function writeDtsJson() {
	const parentConfigFile = readJsonSync<any>(CONFIG_FILE);
	const { ___tabs, ___lastNewLine } = parentConfigFile;

	if (!parentConfigFile.exclude || !parentConfigFile.exclude.includes('_export_all_in_once_index.ts')) {
		console.error(`\x1B[38;5;9mtsconfig.json do not exclude '_export_all_in_once_index.ts' file, this may not work.\x1B[0m`);
	}

	writeJsonSyncIfChange(DTS_CONFIG_FILE, {
		___tabs, ___lastNewLine,
		extends: relativePosix(EXPORT_TEMP_PATH, CONFIG_FILE),
		compilerOptions: {
			removeComments: false,
			declaration: true,
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
		exclude: [],
		include: ['extracted-source/**/*.ts', 'extracted-source/**/*.json'],
		files: [],
	});

	return relativePosix(PROJECT_ROOT, DTS_CONFIG_FILE);
}

export function getOutputFilePath(relativeTo: string, options: CompilerOptions) {
	const { outDir, outFile, baseUrl } = options;

	const targetDir = outDir || dirname(outFile + '') || baseUrl;
	console.log(relativeTo, resolve(targetDir, '_export_all_in_once_index'));
	return relativePosix(relativeTo, resolve(targetDir, '_export_all_in_once_index'));
}
