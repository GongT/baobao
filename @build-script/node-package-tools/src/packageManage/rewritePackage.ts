import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

function sort(object: any): any {
	if (typeof object !== 'object') {
		// Not to sort the array
		return object;
	}
	if (Array.isArray(object)) {
		return object.sort();
	}
	const keys = Object.keys(object);
	keys.sort();
	const newObject: any = {};
	for (const key of keys) {
		newObject[key] = sort(object[key]);
	}
	return newObject;
}

export async function rewritePackage(path: string) {
	const file = resolve(path, 'package.json');
	const json = sort(JSON.parse(await readFile(file, 'utf-8')));
	await writeFile(file, JSON.stringify(json, null, 2), 'utf-8');
}
