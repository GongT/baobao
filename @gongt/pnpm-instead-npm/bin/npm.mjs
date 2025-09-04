#!/usr/bin/env node

/// <reference types="node" />

import { execa } from 'execa';
import { existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, resolve } from 'node:path';
import which from 'which';

// console.error('>>>', process.execPath, ...process.execArgv, ...process.argv.slice(1));

const options = {
	stdio: 'inherit',
	shell: false,
	env: { EXEC_BY_PNPM: 'yes' },
};

function should_use_npm(argv) {
	if (argv.includes('--help') || argv.includes('-h') || argv.includes('--version') || argv.includes('-v')) {
		return true;
	}
	const first_cmd = argv.find((e) => !e.startsWith('-'));

	const passCmds = ['login', 'audit', 'completion', 'config', 'help-search', 'version', 'search', 'view', 'whoami'];
	// console.log('first', first_cmd);
	for (const cmd of passCmds) {
		if (cmd.startsWith(first_cmd)) {
			return true;
		}
	}
	return false;
}

async function main() {
	const argv = process.argv.slice(2);

	if (should_use_npm(argv) || process.env.EXEC_BY_PNPM || process.env.INSTALL_RUN_LOCKFILE_PATH) {
		// console.error('run npm');
		const resolver = createRequire(import.meta.filename);
		const pkgPath = resolver.resolve('npm/package.json');
		const bins = resolver(pkgPath).bin;
		const npmBin = resolve(pkgPath, '..', bins.npm);

		process.argv[1] = npmBin;
		const require = createRequire(npmBin);
		const id = `./${basename(npmBin)}`;
		// console.error('\x1B[2mrequire: %s from %s', id, npmBin, '\x1B[0m');
		return require(id);
	}
	if (process.cwd().includes('/temp/install-run/')) {
		if (!existsSync('pnpm-workspace.yaml')) {
			writeFileSync('pnpm-workspace.yaml', '');
		}
	}
	// console.error('run PNPM');
	const pnpmBin = await which('pnpm');
	// console.error('\x1B[2mexecute:', pnpmBin, ...argv, '\x1B[0m');
	const r = await execa(pnpmBin, [...argv], options);

	if (r.signal) {
		process.exit(1);
	}

	process.exit(r.exitCode);
}

main().catch((e) => {
	console.error('failed execute child:', e);
	process.exit(1);
});
