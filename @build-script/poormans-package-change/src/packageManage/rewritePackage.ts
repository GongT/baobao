import { readJSON, writeJson } from 'fs-extra';
import { resolve } from 'path';

export async function rewritePackage(path: string) {
	const file = resolve(path, 'package.json');
	const json = await readJSON(file);
	await writeJson(file, json);
}
