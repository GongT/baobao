#!/usr/bin/env node

// require('source-map-support/register');
const { prettyPrintError } = require('@idlebox/node');

module.exports.run = run;

async function run() {
	const { default: main } = require('./lib/index.cjs');
	return await main();
}

if (require.main === module) {
	Error.stackTraceLimit = Infinity;
	run().catch((e) => {
		prettyPrintError('rush-tools', e);
		process.exit(1);
	});
}
