process.env.DEBUG_HIDE_DATE = '1';

import { execute } from './index.js';

const tsFile = process.argv[2];
if (!tsFile) {
	console.error('Usage: es-node <path-to-ts-file> ...arguments');
	process.exit(1);
}

const absolutePath = new URL(tsFile, import.meta.url).href;
process.argv.splice(2, 1);

await execute(absolutePath);
