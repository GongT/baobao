#!/usr/bin/env node

require('source-map-support/register');

const fixEsm = require('fix-esm');

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

fixEsm.register();
const { colorDim, colorReset, getVersion } = require('../lib/common/func');
console.log('%s[build-script] v%s%s', colorDim, getVersion(), colorReset);

const loader = require('../lib/cmd-loader.js');
fixEsm.unregister();

if (cmd === 'init') {
	loader.load(path.resolve(__dirname, '../lib/cmd/init'));
} else if (cmd === 'tool') {
	const tool = process.argv[3];
	loader.load(path.resolve(__dirname, '../lib/tool', tool));
} else if (cmd) {
	loader.load(path.resolve(__dirname, '../lib/cmd/run'));
} else {
	loader.load(path.resolve(__dirname, '../lib/show-help'));
}
