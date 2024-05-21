#!/usr/bin/env node

/// <reference types="node" />

import { execa } from 'execa';
import { existsSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { basename, resolve } from 'path';
import which from 'which';

// console.error('>>>', process.execPath, ...process.execArgv, ...process.argv.slice(1));

const options = {
	stdio: 'inherit',
	shell: false,
	env: { EXEC_BY_PNPM: 'yes' },
};

async function main() {
	const argv = process.argv.slice(2);

	let r;
	if (process.env.EXEC_BY_PNPM || process.env.INSTALL_RUN_LOCKFILE_PATH) {
		// console.error('run npx');
		const resolver = createRequire(import.meta.filename);
		const pkgPath = resolver.resolve('npm/package.json');
		const bins = resolver(pkgPath).bin;
		const npxBin = resolve(pkgPath, '..', bins.npx);

		process.argv[1] = npxBin;
		const require = createRequire(npxBin);
		const id = './' + basename(npxBin);
		// console.error('\x1B[2mrequire: %s from %s', id, npmBin, '\x1B[0m');
		return require(id);
	} else {
		if (process.cwd().includes('/temp/install-run/')) {
			if (!existsSync('pnpm-workspace.yaml')) {
				writeFileSync('pnpm-workspace.yaml', '');
			}
		}
		// console.error('run PNPX');
		const pnpxBin = await which('pnpx');
		// console.error('\x1B[2mexecute:', pnpmBin, ...argv, '\x1B[0m');
		r = await execa(pnpxBin, [...argv], options);
	}

	if (r.signal) {
		process.exit(1);
	}

	process.exit(r.exitCode);
}

main().catch((e) => {
	console.error('failed execute child:', e);
	process.exit(1);
});
