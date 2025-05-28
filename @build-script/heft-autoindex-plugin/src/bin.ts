import { loadConfigJson, wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { findPackageJSON } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import json from './config-file-schema.json';
import { createIndex } from './inc/create.js';

const logger = wrapConsoleLogger();

const argv = process.argv.slice(2);

if (argv.length !== 1) {
	console.error('usage: typescript-create-index <tsconfig.json>');
	process.exit(1);
}

const project = resolve(process.cwd(), argv[0]);
logger.log(`using project: ${project}`);
const cmd = loadTsConfigJsonFile(project, ts);

const pkgJson = findPackageJSON(pathToFileURL(project));
if (!pkgJson) {
	throw new Error(`cannot find package.json for ${project}`);
}
const root = dirname(pkgJson);
const config = loadConfigJson<{ filename: string }>(root, 'autoindex', json);

const output = config?.filename || 'src/__create_index.generated.ts';
const outputAbs = resolve(root, output);

createIndex(ts, cmd, logger, outputAbs);
