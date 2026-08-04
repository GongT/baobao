import { LinuxErrorCode, type IPackageJson } from '@idlebox/common';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

export async function importPackageJson(file: string): Promise<IPackageJson> {
	try {
		const path = file.startsWith('file:') ? file : pathToFileURL(file).href;
		const pkg = await import(path, { with: { type: 'json' } });
		return pkg.default;
	} catch (e: any) {
		if (e.code !== 'ERR_MODULE_NOT_FOUND') {
			throw e;
		}

		const ee = new Error(`No such file: ${file}`);
		Object.assign(ee, { code: LinuxErrorCode.ENOENT });
		Error.captureStackTrace(ee, importPackageJson);
		throw ee;
	}
}

export async function loadPackageYaml(file: string): Promise<IPackageJson> {
	const text = await readFile(file, 'utf-8');
	return parse(text);
}
