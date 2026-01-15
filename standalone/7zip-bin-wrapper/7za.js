#!/usr/bin/env node

const path7za = require('7zip-bin').path7za.replace(/\.asar([/\\])/, (_m0, sp) => {
	return `.asar.unpacked${sp}`;
});

require('node:child_process').spawnSync(path7za, process.argv.slice(2), {
	stdio: 'inherit',
	shell: false,
});
