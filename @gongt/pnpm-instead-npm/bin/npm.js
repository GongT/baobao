#!/usr/bin/env node

/// <reference lib="node" />

const { createRequire } = require('module');
const { readlinkSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const pnpmGlobalBin = resolve(process.execPath, '..', 'pnpm');
// console.error('pnpm should at', pnpmGlobalBin);

let req;
try {
	const pnpmLinkValue = readlinkSync(pnpmGlobalBin);
	// console.error('    pnpm is symlink', pnpmLinkValue);
	const pnpmNodeBin = resolve(pnpmGlobalBin, '..', pnpmLinkValue);
	// console.error('    target is', pnpmNodeBin);
	req = createRequire(pnpmNodeBin);
} catch (e) {
	if (e.code !== 'EINVAL') {
		throw e;
	}
	const content = readFileSync(pnpmGlobalBin, 'utf-8');

	const reg = /NODE_PATH="(\/.+)"/gm;
	const matches = reg.exec(content);
	if (matches) {
		// console.error('    matching bash script path', matches[1]);
		req = createRequire(resolve(matches[1], 'a.js'));
	} else {
		throw new Error('can not find pnpm install path');
	}
}

const argv = process.argv.slice(2);
if (process.env.EXEC_BY_PNPM || process.env.INSTALL_RUN_LOCKFILE_PATH) {
	// console.error('corepack run npm', argv);
	req('corepack/dist/corepack.js').runMain(['npm', ...argv]);
} else {
	if (process.cwd().includes('/temp/install-run/')) {
		if (!existsSync('pnpm-workspace.yaml')) {
			writeFileSync('pnpm-workspace.yaml', '');
		}
	}
	process.env.EXEC_BY_PNPM = 'yes';
	// console.error('corepack run PNPM', argv);
	req('corepack/dist/corepack.js').runMain(['pnpm', ...argv]);
}
