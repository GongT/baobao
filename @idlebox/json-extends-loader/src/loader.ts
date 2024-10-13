import { parse } from 'comment-json';
import { readFileSync } from 'node:fs';

interface IProcess {
	(file: string, data: any): void;
}

export function createDynamicReader(processor: IProcess) {
	return function wrappedReadJsonFile(filePath: string) {
		const ret = readJsonFile(filePath);
		processor(filePath, ret);
		return ret;
	};
}

export function readJsonFile(filePath: string): any {
	return parse(readFileSync(filePath, 'utf-8'));
}
