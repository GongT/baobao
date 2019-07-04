#!/usr/bin/env node
require('source-map-support/register');

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
require('./lib/index.js');
