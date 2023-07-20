#!/usr/bin/env node

console.log('post rush install');

const fs = require('fs');
const path = require('path');
const tempDir = path.resolve(__dirname, '../temp');

const installRun = path.resolve(tempDir, 'install-run');
fs.mkdirSync(installRun, { recursive: true });

const fakefile = path.resolve(installRun, 'pnpm-workspace.yaml');
if (!fs.existsSync(fakefile)) {
	console.log('create empty file: ', fakefile);
	fs.writeFileSync(fakefile, '');
}
