import { wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { resolve } from 'node:path';
import ts from 'typescript';
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

createIndex(ts, cmd, logger);
