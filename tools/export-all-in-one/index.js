#!/usr/bin/env node
require('source-map-support/register');

let p;
if (process.argv.includes('--inject')) {
	p = require('./lib/injectPackage').default();
} else {
	p = require('./lib/mainBuild').default();
}

Promise.resolve(p).then(() => {
	process.exit(0);
}, (err) => {
	console.error('\x1B[K!');
	console.error(err);
	process.exit(1);
});
