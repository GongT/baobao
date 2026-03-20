import { logger } from '@idlebox/cli';
import { definePrivateConstant, isNotExistsError } from '@idlebox/common';
import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'yaml';

const originalFilePath = Symbol('originalFilePath');

export async function loadYaml(file: string) {
	const { data, file: realPath } = await tryReadFile(file);
	const obj = parse(data, {});
	definePrivateConstant(obj, originalFilePath, realPath);
	return obj;
}
export async function tryReadFile(file: string) {
	try {
		const data = await readFile(file, 'utf8');
		return { data, file };
	} catch (e) {
		logger.verbose`read relative<${file}> failed: ${e ? (e as any).code : e}`;
		if (!isNotExistsError(e)) {
			throw e;
		}

		if (file.endsWith('.yaml')) {
			file = `${file.slice(0, -5)}.yml`;
		} else if (file.endsWith('.yml')) {
			file = `${file.slice(0, -4)}.yaml`;
		} else {
			throw e;
		}
		try {
			const data = await readFile(file, 'utf8');
			return { data, file };
		} catch (ee) {
			logger.verbose`read relative<${file}> failed: ${ee ? (ee as any).code : ee}`;
			if (isNotExistsError(ee)) {
				throw e;
			}

			throw ee;
		}
	}
}

export async function writeYaml(data: any) {
	const file = (data as any)[originalFilePath];
	if (!file) throw new Error('not opened by loadYaml()');

	await writeFile(file, stringify(data), 'utf8');
}
