#!/usr/bin/env node

if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	const { install } = await import('source-map-support');
	install();
}

import { registerNodejsExitHandler } from '@idlebox/node';

registerNodejsExitHandler();

await import('./lib/main.js');
