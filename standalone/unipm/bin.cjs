#!/usr/bin/env node
require('source-map-support/register');

const fs = require('fs');
const path = require('path');

Error.stackTraceLimit = Infinity;
require(`./lib/index.cjs`).default().catch((e) => {
	console.error(e);
	process.exit(1);
});
