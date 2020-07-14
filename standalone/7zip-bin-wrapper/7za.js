#!/usr/bin/env node

const path7za = require('7zip-bin').path7za.replace(/\.asar([\/\\])/, (m0, sp) => {
	return '.asar.unpacked' + sp;
});

require('child_process').spawnSync(path7za, process.argv.slice(2), {
	stdio: 'inherit',
	shell: false,
});
