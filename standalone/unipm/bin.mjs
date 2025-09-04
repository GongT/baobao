#!/usr/bin/env node
import '@idlebox/source-map-support/register';

Error.stackTraceLimit = Number.POSITIVE_INFINITY;
process.on('uncaughtException', (error, _origin) => {
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

await import('./lib/esm/index.js')
	.then((e) => {
		return e.main();
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
