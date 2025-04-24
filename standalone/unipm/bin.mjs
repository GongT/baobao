#!/usr/bin/env node
if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	await import('source-map-support/register.js');
}

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
process.on('uncaughtException', (error, origin) => {
	console.error('[uncaughtException] %s', error.stack || error.message || error);
});

process.on('unhandledRejection', (reason, promise) => {
	if (reason instanceof Error) {
		console.error('[unhandledRejection] %s', reason.stack || reason.message || reason);
	} else {
		console.error('[unhandledRejection] reason:', reason);
	}
	console.error('[unhandledRejection]', promise);
});

await import('./lib/esm/index.mjs')
	.then((e) => {
		return e.default();
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
