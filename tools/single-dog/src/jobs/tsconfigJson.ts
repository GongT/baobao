import { readdir, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { locateRootRelativeToProject } from '../inc/template';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';

async function writeTestIndex() {
	console.log('create hello world index.ts.');
	await writeFile(resolve(CONTENT_ROOT, 'src/index.ts'), `
export function test(): string {
	return "hello world";
}
`);
}

export async function updateTsconfigJson() {
	const tsconfigPath = resolve(CONTENT_ROOT, 'src/tsconfig.json');
	const tsconfig: any = await loadJsonFileIfExists(tsconfigPath);
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

	await writeJsonFileBack(tsconfig);

	if ((await readdir(resolve(CONTENT_ROOT, 'src'))).length === 1) {
		await writeTestIndex();
	}
}
