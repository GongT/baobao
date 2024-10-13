import { resolve } from 'node:path';
import { createDynamicReader } from './loader.js';

function localResolve(object: any, key: number | string, currentFile: string) {
	object[key] = resolve(currentFile, '..', object[key]);
}

function tsconfigParser(file: string, tsconfig: any) {
	for (const key of ['outDir', 'rootDir', 'tsBuildInfoFile']) {
		if (!tsconfig.compilerOptions[key]) continue;
		localResolve(tsconfig.compilerOptions, key, file);
	}
	for (const key of ['typeRoots']) {
		const arr = tsconfig.compilerOptions[key];
		if (!arr) continue;
		for (let index = 0; index < arr.length; index++) {
			localResolve(arr, index, file);
		}
	}
}
export const tsconfigReader = createDynamicReader(tsconfigParser);
