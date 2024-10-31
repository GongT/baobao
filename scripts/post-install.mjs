#!/usr/bin/env node

console.log('[script] post rush install');

import { existsSync, readdirSync, symlinkSync } from 'fs';
import { relative, resolve } from 'path';
import { ensureSymLinkSync, globalNodeModules, lstat_catch, projects, readJson } from './pre-post-inc.mjs';

console.log('[script] %s', globalNodeModules);
const tools = {
	tsc: 'typescript/bin/tsc',
	eslint: 'eslint/bin/eslint.js',
	prettier: 'prettier/bin/prettier.cjs',
	// lerna: 'lerna/dist/cli.js',
	// nx: 'nx/bin/nx.js',
};

for (const { path } of projects()) {
	linkTools(path);
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

function linkTools(path) {
	const localBinDir = resolve(path, 'node_modules/.bin');
	for (const [tool, path] of Object.entries(tools)) {
		const targetFile = relative(localBinDir, resolve(globalNodeModules, path));
		const linkFile = resolve(localBinDir, tool);
		ensureSymLinkSync(linkFile, targetFile);
	}
}
