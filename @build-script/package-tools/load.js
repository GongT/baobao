#!/usr/bin/env node

if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	const { install } = await import('source-map-support');
	install();
}

import { registerNodejsExitHandler } from '@idlebox/node';

registerNodejsExitHandler();

setTimeout(() => {
	console.log('timeout');
}, 10000);

await import('./lib/main.js');
