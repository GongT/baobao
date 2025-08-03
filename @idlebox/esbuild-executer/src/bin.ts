process.env.DEBUG_HIDE_DATE = '1';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { execute } from './index.js';

const tsFile = process.argv[2];
if (!tsFile) {
	console.error('Usage: es-node <path-to-ts-file> ...arguments');
	process.exit(1);
}

const absolutePath = new URL(tsFile, `${pathToFileURL(process.cwd())}/`).href;
process.argv.splice(1, 2, fileURLToPath(absolutePath)); // Replace the first argument with the absolute path

await execute(absolutePath);
