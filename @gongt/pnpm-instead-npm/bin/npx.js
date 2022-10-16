#!/usr/bin/env node

const { createRequire } = require('module');
const { readlinkSync } = require('fs');
const { resolve } = require('path');
const { exec } = require('../library/lib');

const pnpmGlobalBin = resolve(process.execPath, '..', 'pnpm');
const pnpmLinkValue = readlinkSync(pnpmGlobalBin);
const pnpmNodeBin = resolve(pnpmGlobalBin, '..', pnpmLinkValue);
const req = createRequire(pnpmNodeBin);

let entry;
if (process.env.EXEC_BY_PNPM) {
	entry = resolve(req.resolve('npm'), '../bin/npx-cli.js');
} else {
	entry = resolve(req.resolve('pnpm'), '../../bin/pnpx.js');
}

const argv = process.argv.slice(2);
exec(entry, argv);
