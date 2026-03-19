import { convertCaughtError } from '@idlebox/common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function convertToSourcePath(filePath: string, required = false): string {
	let mapFile = `${filePath}.map`;
	if (mapFile.startsWith('file://')) {
		mapFile = mapFile.slice(7);
	}

	let mapData;
	try {
		mapData = JSON.parse(readFileSync(mapFile, 'utf-8'));
	} catch (e) {
		if (required) {
			const ee = new Error(`无法读取source-map文件: ${mapFile}`);
			ee.cause = convertCaughtError(e);
			throw ee;
		}
		return filePath;
	}

	const { sourceRoot, sources } = mapData;
	const firstSource = sources[0];
	if (!firstSource) {
		return filePath;
	}

	let curs = resolve(mapFile, '..');
	if (sourceRoot) {
		curs = resolve(curs, sourceRoot);
	}
	return resolve(curs, firstSource);
}
