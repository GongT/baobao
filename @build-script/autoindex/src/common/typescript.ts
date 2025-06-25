import { logger } from '@idlebox/logger';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type TypeScriptApi from 'typescript';
import type { IContext } from './config.js';
import { getTypescript } from './tsconfig-loader.js';

export async function loadTypescript(context: IContext) {
	let tsconfigFile: string = context.project;
	if (statSync(tsconfigFile).isDirectory()) {
		tsconfigFile = resolve(tsconfigFile, 'tsconfig.json');
		if (!existsSync(tsconfigFile)) {
			throw logger.fatal(`missing "tsconfig.json" in: ${tsconfigFile}`);
		}
	} else if (!existsSync(tsconfigFile)) {
		throw logger.fatal(`missing tsconfig: ${tsconfigFile}`);
	}

	const ts: typeof TypeScriptApi = await getTypescript(tsconfigFile, logger);
	logger.log('typescript version: %s', ts.version);

	return {
		ts,
		file: tsconfigFile,
	} as const;
}
