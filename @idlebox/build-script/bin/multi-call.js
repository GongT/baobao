#!/usr/bin/env node

require('source-map-support/register');

const fs = require('fs');
const path = require('path');

const cmd = process.argv[2];
Error.stackTraceLimit = Infinity;

global.PROJECT_PATH = process.cwd();

if (cmd === 'init') {
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/cmd/init'));
} else if (cmd === 'tool') {
	const tool = process.argv[3];
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/tool', tool));
} else if (cmd) {
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/cmd/run'));
} else {
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/show-help'));
}
