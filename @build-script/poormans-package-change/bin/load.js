#!/usr/bin/env node

require('source-map-support/register');
const { prettyPrintError } = require('@idlebox/node');

const cmdList = {
	'detect-package-change': '../lib/detect-package-change.js',
	'run-if-version-mismatch': '../lib/run-if-version-mismatch.js',
};

(() => {
	const cmd = process.argv.splice(2, 1)[0];
	if (cmd === undefined) {
		console.error('Command is required.');
	} else if (cmdList[cmd]) {
		const { main } = require(cmdList[cmd]);
		return Promise.resolve(process.argv.slice(2)).then(main);
	} else {
		console.error('Unknown command: %s', cmd);
	}
	console.error('available commands: %s', Object.keys(cmdList).join(', '));
	process.exit(1);
})().then(
	(ret) => {
		process.exit(ret);
	},
	(e) => {
		prettyPrintError('main', e);
		process.exit(1);
	}
);
