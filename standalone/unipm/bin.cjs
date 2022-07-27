#!/usr/bin/env node
if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	require('source-map-support/register');
}

Error.stackTraceLimit = Infinity;
require(`./lib/index.cjs`)
	.default()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
