import { loadJsonFile, loadJsonFileIfExists, writeJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { ensureDir, readdir, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { debug } from '../inc/debug';
import { getTemplatePath, locateRootRelativeToProject } from '../inc/template';
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
	tsconfig.extends = await locateRootRelativeToProject('src/tsconfig.json', 'package/tsconfig.json');
	if (!tsconfig.compilerOptions) {
		tsconfig.compilerOptions = {};
	}
	if (!tsconfig.compilerOptions.module) {
		tsconfig.compilerOptions.module = 'commonjs';
	}
	if (!tsconfig.compilerOptions.outDir) {
		if (libMode) {
			tsconfig.compilerOptions.outDir = '../lib/cjs';
		} else {
			tsconfig.compilerOptions.outDir = '../lib';
		}
	} else if (libMode && !/[\\/]cjs$/.test(tsconfig.compilerOptions.outDir)) {
		tsconfig.compilerOptions.outDir += '/cjs';
	}
	if (!tsconfig.compilerOptions.rootDir) {
		tsconfig.compilerOptions.rootDir = '.';
	}
	if (!tsconfig.compilerOptions.typeRoots) {
		tsconfig.compilerOptions.typeRoots = ['../node_modules/@types'];
	}

	debug('write tsconfig file');
	await writeJsonFileBack(tsconfig);

	if (libMode) {
		const tsconfig: any = await loadJsonFile(getTemplatePath('tsconfig.esm.json'));
		const target = resolve(CONTENT_ROOT, 'src/tsconfig.esm.json');
		debug('write tsconfig.esm.ts file');
		await writeJsonFile(target, tsconfig);
	}

	if ((await readdir(resolve(CONTENT_ROOT, 'src'))).length === 1) {
		debug('write hello index.ts file');
		await writeTestIndex();
	}
}
