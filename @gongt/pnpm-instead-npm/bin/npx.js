#!/usr/bin/env node

const { createRequire } = require('module');
const { readlinkSync, readFileSync } = require('fs');
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
if (process.env.EXEC_BY_PNPM) {
	// console.error('corepack run npm', argv);
	req('corepack/dist/corepack.js').runMain(['npx', ...argv]);
} else {
	// console.error('corepack run PNPM', argv);
	req('corepack/dist/corepack.js').runMain(['pnpx', ...argv]);
}
