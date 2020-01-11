#!/usr/bin/env node

require('source-map-support/register');

const {prettyPrintError} = require('@idlebox/node-helpers');
Promise.resolve().then(() => {
	return require('./lib/index').default();
}).then(() => {
}, (e) => {
	prettyPrintError('rush-tools', e);
	process.exit(1);
});
