import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';

export const overwriteSafeMark =
	'/** GENERATED FILE, DO NOT MODIFY ANY SINGLE BYTE. 7fb39c00-19e3-47cd-8687-15751b438d87 **/';

export function writeFileIfChangeSafeSync(file: string, data: string) {
	if (existsSync(file)) {
		const old = readFileSync(file, 'utf-8');
		if (old === data) {
			return false;
		}
		if (!old.includes(overwriteSafeMark)) {
			throw new Error(`generate will overriding file: ${file}`);
		}
	}

	if (!data.includes(overwriteSafeMark)) {
		throw new Error(`missing override mark: ${file}`);
	}

	writeFileSync(file, data, 'utf-8');
	return true;
}

export async function writeFileIfChange(file: string, data: string) {
	let exists = false;
	try {
		await access(file);
		exists = true;
	} catch {}

	if (exists) {
		const old = await readFile(file, 'utf-8');
		if (old === data) {
			return false;
		}
	}

	await writeFile(file, data, 'utf-8');
	return true;
}
