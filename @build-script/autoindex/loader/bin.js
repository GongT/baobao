if (!process.execArgv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	const { install } = await import('source-map-support');
	install();
}

await import('../lib/bin.js');
