#!/usr/bin/env node
require('source-map-support/register');

const verb = process.argv.slice(2).find(item => !item.startsWith('-')) || 'sync';
const fs = require('fs');

if (process.argv.includes('-w')) {
	const wd = process.argv[process.argv.indexOf('-w') + 1];
	if (fs.existsSync(wd) && fs.statSync(wd).isDirectory()) {
		global.CONTENT_ROOT = wd;
	} else {
		console.error('Error: target path not exists: %s', wd);
		process.exit(1);
	}
} else {
	global.CONTENT_ROOT = process.cwd();
}
global.TEMPLATE_ROOT = __dirname + '/package';

let fn;
switch (verb) {
case 'sync':
	fn = require('./lib/command/sync.js').default;
	break;
default:
	fn = require('./lib/command/script-loader.js').default;
	break;
}

fn().catch((e) => {
	setImmediate(() => {
		throw e;
	});
});
