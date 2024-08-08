if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	await import('source-map-support/register.js');
} else {
}

await import('./lib/index.js');
