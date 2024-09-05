#!/usr/bin/env node

console.log('[script] post rush install');

import { existsSync, mkdirSync, readdirSync, symlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { lstat_catch, projects, readJson, tempDir } from './pre-post-inc.mjs';

console.log('[script] %s', tempDir);

const installRun = resolve(tempDir, 'install-run');
mkdirSync(installRun, { recursive: true });

const fakefile = resolve(installRun, 'pnpm-workspace.yaml');
if (!existsSync(fakefile)) {
	console.log('create empty file: ', fakefile);
	writeFileSync(fakefile, '');
}

const globalNodeModules = resolve(tempDir, 'node_modules');

for (const path of projects()) {
	// hoistTypesInstall(path);
}

function hoistTypesInstall(dir) {
	console.log('patching @types in: %s', dir);
	const localTypes = resolve(dir, 'node_modules/@types');
	const items = readdirSync(localTypes);
	for (const item of items) {
		const pkg = readJson(resolve(localTypes, item, 'package.json'));
		if (!pkg.dependencies) continue;

		console.log('  - %s has %s dependencies', item, Object.keys(pkg.dependencies));

		for (const name of Object.keys(pkg.dependencies)) {
			installPackage(name, dir);
		}
	}
}

function installPackage(name, target) {
	const targetLink = resolve(target, 'node_modules', name);
	const stat = lstat_catch(targetLink);
	if (stat) return;
	const source = resolve(globalNodeModules, name);

	if (!existsSync(source)) {
		throw new Error(`missing package "${name}" in ${globalNodeModules}`);
	}

	symlinkSync(source, targetLink, 'junction');
}
