#!/usr/bin/env node

/// <reference types="node" />

const { createRequire } = require('module');
const { spawnSync } = require('child_process');
const { readlinkSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

main();

function runPm(env, path, ...argv) {
	console.error('\x1B[2mexecute:', process.execPath, ...process.execArgv, path, ...argv, '\x1B[0m');
	return spawnSync(process.execPath, [...process.execArgv, path, ...argv], {
		stdio: 'inherit',
		shell: false,
		env: { ...process.env, ...env },
	});
}

function main() {
	let p;
	if (process.env.COREPACK_LIB_PATH) {
		p = process.env.COREPACK_LIB_PATH;
	} else {
		p = detect();
		process.env.COREPACK_LIB_PATH = p;
	}

	const bins = require(p).bin;
	// console.error('corepack bins:', bins);

	const argv = process.argv.slice(2);
	let r;
	if (process.env.EXEC_BY_PNPM || process.env.INSTALL_RUN_LOCKFILE_PATH) {
		// console.error('corepack run npm', );
		r = runPm({}, resolve(p, '..', bins.corepack), 'npm', ...argv);
	} else {
		if (process.cwd().includes('/temp/install-run/')) {
			if (!existsSync('pnpm-workspace.yaml')) {
				writeFileSync('pnpm-workspace.yaml', '');
			}
		}
		// console.error('corepack run PNPM', );
		const env = { EXEC_BY_PNPM: 'yes' };
		r = runPm(env,  resolve(p, '..', bins.pnpm), ...argv);
	}

	if (r.error) {
		throw r.error;
	}

	if (r.signal) {
		process.kill(process.pid, r.signal);
		process.exit(1);
	} else {
		process.exit(r.status);
	}
}

function detect() {
	const pnpmGlobalBin = resolve(process.execPath, '..', 'pnpm');
	// console.error('pnpm should at', pnpmGlobalBin);

	let pnpm_lib;
	try {
		const pnpmLinkValue = readlinkSync(pnpmGlobalBin);
		// console.error('    pnpm is symlink', pnpmLinkValue);
		const pnpmNodeBin = resolve(pnpmGlobalBin, '..', pnpmLinkValue);
		// console.error('    target is', pnpmNodeBin);
		pnpm_lib = pnpmNodeBin;
	} catch (e) {
		if (e.code !== 'EINVAL') {
			// not symlink
			throw e;
		}
		const content = readFileSync(pnpmGlobalBin, 'utf-8');

		const reg = /NODE_PATH="(\/.+)"/gm;
		const matches = reg.exec(content);
		if (matches) {
			// console.error('    matching bash script path', matches[1]);
			pnpm_lib = resolve(matches[1], 'a.js');
		} else {
			throw new Error('can not find pnpm install path');
		}
	}

	return createRequire(pnpm_lib).resolve('corepack/package.json');
}
