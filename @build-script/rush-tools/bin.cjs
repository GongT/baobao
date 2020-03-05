#!/usr/bin/env node

require('@build-script/dual-package-runtime');
require('source-map-support/register');

const { prettyPrintError } = require('@idlebox/node');
Promise.resolve()
	.then(() => {
		return require('./lib/index').default();
	})
	.then(
		() => {},
		(e) => {
			prettyPrintError('rush-tools', e);
			process.exit(1);
		}
	);
