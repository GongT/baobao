#!/usr/bin/env node
require('source-map-support/register');

if (process.argv.length === 2) { // node export-all-in-one --inject src
	console.error(`Usage:
	export-all-in-one <--inject> /path/to[/tsconfig.json]
`);
	process.exit(1);
}

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
