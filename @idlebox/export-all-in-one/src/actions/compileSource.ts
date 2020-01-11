import { run } from '../inc/run';
import { dirname, resolve } from 'path';
import { CompilerOptions } from 'typescript';
import { CONFIG_FILE, DTS_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from '../inc/argParse';
import { relativePosix } from '../inc/paths';
import { loadJsonFile, writeJsonFileBack, writeJsonFileIfChanged } from '@idlebox/node-json-edit';
import { ensureDir } from 'fs-extra';
import { getOptions } from '../inc/configFile';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';

async function rewriteProjectDtsJson() {
	const json = await loadJsonFile(CONFIG_FILE);
	if (!json.compilerOptions) {
		json.compilerOptions = {};
	}
	json.compilerOptions.declaration = false;
	json.compilerOptions.declarationMap = false;
	await writeJsonFileBack(json);
}

async function writeDtsJson() {
	const command = getOptions(CONFIG_FILE);

	await ensureDir(dirname(DTS_CONFIG_FILE));
	await writeJsonFileIfChanged(DTS_CONFIG_FILE, {
		extends: CONFIG_FILE,
		compilerOptions: {
			removeComments: false,
			declaration: true,
			declarationMap: true,
			sourceMap: false,
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
			typeRoots: command.options.typeRoots,
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
	if (!targetDir) {
		throw new Error('Please compile to other directory, do not compile in place.');
	}
	console.log(relativeTo, resolve(targetDir, '_export_all_in_one_index'));
	return relativePosix(relativeTo, resolve(targetDir, '_export_all_in_one_index'));
}

export async function compileSource() {
	console.log('\x1B[38;5;10mwrite tsconfig.json...\x1B[0m');
	await rewriteProjectDtsJson();
	await writeDtsJson();
	await ensureLinkTarget(resolve(PROJECT_ROOT, 'node_modules'), resolve(EXPORT_TEMP_PATH, 'node_modules'));
	await run('tsc', ['-p', EXPORT_TEMP_PATH]);
}
