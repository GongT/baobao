import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
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
			logger.error(`missing "tsconfig.json" in: long<${tsconfigFile}>`);
			shutdown(1);
		}
	} else if (!existsSync(tsconfigFile)) {
		logger.error(`missing tsconfig: long<${tsconfigFile}>`);
		shutdown(1);
	}

	const ts: typeof TypeScriptApi = await getTypescript(tsconfigFile, logger);
	logger.log('typescript version: %s', ts.version);

	return {
		ts,
		file: tsconfigFile,
	} as const;
}
