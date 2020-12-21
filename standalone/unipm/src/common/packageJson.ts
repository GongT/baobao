import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { sortByString } from '@idlebox/common';

export async function resortPackage(file: string) {
	const original: any = await loadJsonFile(file);
	for (const k of ['devDependencies', 'dependencies']) {
		if (original[k]) {
			original[k] = sort(original[k]);
		}
	}
	await writeJsonFileBack(original);
}

function sort(obj: any): any {
	const ret: any = {};
	const sortedKey = Object.keys(obj).sort(sortByString);
	for (const k of sortedKey) {
		ret[k] = obj[k];
	}
	return ret;
}
