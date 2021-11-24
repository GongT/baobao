#!/usr/bin/env node

// require('@build-script/dual-package-runtime');
require('source-map-support/register');
const fixEsm = require('fix-esm');

const __require = require('esm')(module);
function _require(id) {
	fixEsm.register();
	const ret = require(id);
	fixEsm.unregister();
	return ret;
}
const { prettyPrintError } = _require('@idlebox/node');

Promise.resolve()
	.then(() => {
		return _require('./lib/index.cjs');
	})
	.then(({ default: main }) => {
		return main();
	})
	.catch((e) => {
		prettyPrintError('rush-tools', e);
		process.exit(1);
	});
