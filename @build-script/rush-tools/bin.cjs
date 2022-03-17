#!/usr/bin/env node

require('source-map-support/register');
const { prettyPrintError } = require('@idlebox/node');

Promise.resolve()
	.then(() => {
		return require('./lib/index.cjs');
	})
	.then(({ default: main }) => {
		return main();
	})
	.catch((e) => {
		prettyPrintError('rush-tools', e);
		process.exit(1);
	});
