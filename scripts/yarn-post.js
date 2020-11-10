const { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync } = require('fs');
const { resolve, relative } = require('path');

const pkg = resolve(__dirname, '../package.json');
const data = require(pkg);
const projects = data.workspaces.packages;

const nameToRel = new Map();
for (const rel of projects) {
	const abs = resolve(__dirname, '..', rel);
	const subPkgData = require(resolve(abs, 'package.json'));
	nameToRel.set(subPkgData.name, rel);
}

for (const rel of projects) {
	const abs = resolve(__dirname, '..', rel);

	const subPkgData = require(resolve(abs, 'package.json'));
	const deps = Object.keys(Object.assign({}, subPkgData.dependencies, subPkgData.devDependencies));
	for (const item of deps) {
		if (nameToRel.has(item)) {
			const linkFile = resolve(abs, 'node_modules', item);
			const dir = resolve(linkFile, '..');

			if (!existsSync(dir)) {
				mkdirSync(dir);
			}

			const source = resolve(__dirname, '..', nameToRel.get(item));
			const linkContent = relative(dir, source);
			// console.log('ln -s %s %s', linkContent, linkFile);
			try {
				lstatSync(linkFile);
				unlinkSync(linkFile);
			} catch {}
			symlinkSync(linkContent, linkFile);
		}
	}
}

console.log('Done.');
