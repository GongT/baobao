#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { argv } from 'node:process';
import { fileURLToPath } from 'node:url';

export async function run() {
	const { default: main } = await import('./lib/esm/index.mjs');
	return await main();
}

const modulePath = fileURLToPath(import.meta.url);
const arg1 = realpathSync(argv[1]);

if (modulePath.startsWith(arg1)) {
	// if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	const { install } = await import('source-map-support');
	install();
	// }
	const { prettyPrintError } = await import('@idlebox/common');

	Error.stackTraceLimit = Infinity;
	run().catch((e) => {
		prettyPrintError('rush-tools', e);
		process.exit(1);
	});
}
