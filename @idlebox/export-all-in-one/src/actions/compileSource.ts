import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { dirname, resolve } from 'path';
import { CompilerOptions } from 'typescript';
import { CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from '../inc/argParse';
import { relativePosix } from '../inc/paths';
import { run } from '../inc/run';
import { createTempTSConfig } from '../inc/createTempTsconfig';

async function rewriteProjectTSConfigJson() {
	const json = await loadJsonFile(CONFIG_FILE);
	if (!json.compilerOptions) {
		json.compilerOptions = {};
	}
	json.compilerOptions.declaration = false;
	json.compilerOptions.declarationMap = false;
	await writeJsonFileBack(json);
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

export async function compileDeclareFiles() {
	console.log('\x1B[38;5;10mwrite tsconfig.json.\x1B[0m');
	await rewriteProjectTSConfigJson();
	const file = await createTempTSConfig({ type: 'declare', want: 'declaration' });
	await ensureLinkTarget(resolve(PROJECT_ROOT, 'node_modules'), resolve(EXPORT_TEMP_PATH, 'node_modules'));
	await run('tsc', ['-p', file]);
}
