#!/usr/bin/env node

require('source-map-support/register');

const fs = require('fs');
const path = require('path');

const cmd = process.argv[2];

global.PROJECT_PATH = process.cwd();

if (cmd) {
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/cmd', cmd));
} else {
	require('../lib/cmd-loader').load(path.resolve(__dirname, '../lib/show-help'));
}
