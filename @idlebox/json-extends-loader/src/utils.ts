import { readFileSync } from 'fs';
import { parse } from 'comment-json';
import { resolve } from 'path';

export function readJsonFile(filePath: string): any {
	return parse(readFileSync(filePath, 'utf-8'));
}

interface IProcess {
	(file: string, data: any): void;
}

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

export function createDynamicReader(processor: IProcess) {
	return function wrappedReadJsonFile(filePath: string) {
		const ret = readJsonFile(filePath);
		processor(filePath, ret);
		return ret;
	};
}
