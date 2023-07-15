import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

export async function rewritePackage(path: string) {
	const file = resolve(path, 'package.json');
	const json = JSON.parse(await readFile(file, 'utf-8'));
	await writeFile(file, JSON.stringify(json, null, 2), 'utf-8');
}
