#!/usr/bin/env node

require('source-map-support/register');
require('fix-esm').register();

if (process.argv.length !== 3) {
	// node export-all-in-one --inject src
	console.error(`Usage:
	export-all-in-one /path/to[/tsconfig.json]
`);
	process.exit(22);
}

Promise.resolve()
	.then(() => {
		return require('./lib/mainBuild').default;
	})
	.then((cb) => {
		return cb();
	})
	.then(
		() => {
			process.exit(0);
		},
		(err) => {
			console.error(err.stack);
			process.exit(1);
		}
	);
