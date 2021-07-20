#!/usr/bin/env node

require('source-map-support/register');

const { emitWarning } = process;
process.emitWarning = (warning, type, code, ...extraArgs) => {
	if (code === 'DEP0097') {
		// https://github.com/gulpjs/gulp/issues/2460
		return;
	}
	emitWarning(warning, type, code, ...extraArgs);
};

const fs = require('fs');
const path = require('path');

const cmd = process.argv[2];
Error.stackTraceLimit = Infinity;

global.PROJECT_PATH = process.cwd();

// require('@build-script/dual-package-runtime');

const { colorDim, colorReset, getVersion } = require('../lib/common/func');
console.log('%s[build-script] v%s%s', colorDim, getVersion(), colorReset);

if (cmd === 'init') {
	require('../lib/cmd-loader.js').load(path.resolve(__dirname, '../lib/cmd/init'));
} else if (cmd === 'tool') {
	const tool = process.argv[3];
	require('../lib/cmd-loader.js').load(path.resolve(__dirname, '../lib/tool', tool));
} else if (cmd) {
	require('../lib/cmd-loader.js').load(path.resolve(__dirname, '../lib/cmd/run'));
} else {
	require('../lib/cmd-loader.js').load(path.resolve(__dirname, '../lib/show-help'));
}
