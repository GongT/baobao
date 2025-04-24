#!/usr/bin/env node

if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	const { install } = await import('source-map-support');
	install();
}

const { prettyPrintError } = await import('@idlebox/common');

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
try {
	const { default: main } = await import('./lib/esm/index.js');
	await main();
} catch (e) {
	prettyPrintError('rush-tools', e);
	process.exit(1);
}
