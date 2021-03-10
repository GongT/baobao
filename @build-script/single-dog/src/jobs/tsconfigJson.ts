import { resolve } from 'path';
import { loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/node-json-edit';
import { ensureDir, readdir, writeFile } from 'fs-extra';
import { debug } from '../inc/debug';
import { locateRootRelativeToProject } from '../inc/template';
import { IRunMode } from './packageJson';

async function writeTestIndex() {
	debug('create hello world index.ts.');
	await writeFile(
		resolve(CONTENT_ROOT, 'src/index.ts'),
		`
export function test(): string {
	return "hello world";
}
`
	);
}

export async function updateTsconfigJson({ libMode }: IRunMode) {
	await ensureDir(resolve(CONTENT_ROOT, 'src'));

	const tsconfigPath = resolve(CONTENT_ROOT, 'src/tsconfig.json');
	const tsconfig: any = await loadJsonFileIfExists(tsconfigPath);
	tsconfig.extends = await locateRootRelativeToProject(
		resolve(CONTENT_ROOT, 'src/tsconfig.json'),
		libMode ? 'package/tsconfig.json' : 'package/tsconfig.no-lib.json'
	);
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
		tsconfig.compilerOptions.typeRoots = ['../node_modules/@types', '../node_modules'];
	}

	debug('write tsconfig file');
	await writeJsonFileBack(tsconfig);

	if ((await readdir(resolve(CONTENT_ROOT, 'src'))).length === 1) {
		debug('write hello index.ts file');
		await writeTestIndex();
	}
}
