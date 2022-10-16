const { createRequire } = require('module');
const { readlinkSync } = require('fs');
const { resolve } = require('path');

const pnpmBin = readlinkSync(resolve(process.execPath, '..', 'pnpm'));
const req = createRequire(pnpmBin);
if (process.env.EXEC_BY_PNPM) {
	req('npm/bin/npx-cli.js');
} else {
	process.env.EXEC_BY_PNPM = 'yes';
	req('pnpm/bin/pnpx.js');
}

function exec(target) {
	let kexec;
	try {
		kexec = require('@gongt/kexec');
	} catch {}

	if (kexec) {
	}
	kexec;
}
