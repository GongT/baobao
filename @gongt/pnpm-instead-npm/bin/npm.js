const { spawnSync } = require('child_process');
const { createRequire } = require('module');
const { readlinkSync, readFileSync } = require('fs');
const { resolve } = require('path');

const pnpmGlobalBin = resolve(process.execPath, '..', 'pnpm');
const pnpmLinkValue = readlinkSync(pnpmGlobalBin);
const pnpmNodeBin = resolve(pnpmGlobalBin, '..', pnpmLinkValue);
const req = createRequire(pnpmNodeBin);

let entry;
if (process.env.EXEC_BY_PNPM) {
	entry = resolve(req.resolve('npm'), '../bin/npm-cli.js');
} else {
	entry = resolve(req.resolve('pnpm'), '../../bin/pnpm.js');
}

const argv = process.argv.slice(2);
exec(entry, argv);

function exec(target, argv) {
	process.env.EXEC_BY_PNPM = 'yes';

	let kexec;
	try {
		kexec = require('@gongt/kexec');
	} catch {}

	if (kexec) {
		kexec(process.execPath, [target, ...argv]);
	}

	const r = spawnSync(process.execPath, [target, ...argv], { stdio: 'inherit', shell: false });
	process.exit(r.status || 1);
}
