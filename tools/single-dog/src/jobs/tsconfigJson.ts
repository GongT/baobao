import { pathExists } from 'fs-extra';
import { resolve } from 'path';
import { locateRootRelativeToProject } from '../inc/template';
import { loadJsonFile, writeJsonFile } from './node-json-edit';

export async function updateTsconfigJson() {
	const tsconfigPath = resolve(CONTENT_ROOT, 'src/tsconfig.json');
	const tsconfig = await pathExists(tsconfigPath)
		? await loadJsonFile(tsconfigPath)
		: {} as any;
	tsconfig.extends = locateRootRelativeToProject('src/tsconfig.json', 'package/tsconfig.json');
	if (!tsconfig.compilerOptions) {
		tsconfig.compilerOptions = {};
	}
	if (!tsconfig.compilerOptions.outDir) {
		tsconfig.compilerOptions.outDir = '../lib';
	}
	if (!tsconfig.compilerOptions.rootDir) {
		tsconfig.compilerOptions.rootDir = '.';
	}
	if (!tsconfig.compilerOptions.typeRoots) {
		tsconfig.compilerOptions.typeRoots = ['../node_modules/@types'];
	}

	await writeJsonFile(tsconfigPath, tsconfig);
}
