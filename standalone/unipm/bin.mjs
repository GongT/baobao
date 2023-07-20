#!/usr/bin/env node
if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	await import('source-map-support/register.js');
}

Error.stackTraceLimit = Infinity;
await import(`./lib/esm/index.mjs`)
	.then((e) => {
		return e.default();
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
