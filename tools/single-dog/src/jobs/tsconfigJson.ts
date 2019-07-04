import { ensureDir, pathExists, readdir, writeFile } from 'fs-extra';
import { dirname, resolve } from 'path';
import { locateRootRelativeToProject } from '../inc/template';
import { loadJsonFile, writeJsonFile } from './node-json-edit';

async function writeTestIndex() {
	await writeFile(resolve(CONTENT_ROOT, 'src/index.ts'), `
export function test(): string {
	return "hello world";
}
`);
}

export async function updateTsconfigJson() {
	const tsconfigPath = resolve(CONTENT_ROOT, 'src/tsconfig.json');
	let tsconfig: any;

	if (await pathExists(tsconfigPath)) {
		tsconfig = await loadJsonFile(tsconfigPath);
	} else {
		tsconfig = {};
		await ensureDir(dirname(tsconfigPath));
	}
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

	if ((await readdir(resolve(CONTENT_ROOT, 'src'))).length === 1) {
		await writeTestIndex();
	}
}
