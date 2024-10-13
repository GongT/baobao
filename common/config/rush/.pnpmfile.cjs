const { resolve, relative } = require('path');
const { readFileSync } = require('fs');

const PROJECT_ROOT = resolve(__dirname, '../../..');
const myProjects = new Set();
const knownTypesVersion = {};

module.exports = {
	hooks: {
		readPackage,
	},
};

function init() {
	const reProjectFolder = /"projectFolder": "(.+)"/g;
	const content = readFileSync(resolve(PROJECT_ROOT, 'rush.json'), 'utf-8');
	let projectFolder;
	while ((projectFolder = reProjectFolder.exec(content))) {
		const p = resolve(PROJECT_ROOT, projectFolder[1], 'package.json');
		const val = loadJsonSync(p);
		myProjects.add(val.name);

		for (const [name, version] of Object.entries({ ...val.dependencies, ...val.devDependencies })) {
			if (name.startsWith('@types/')) {
				knownTypesVersion[name] = version;
			}
		}
	}
}

function readPackage(packageJson, context) {
	if (myProjects.size === 0) init();

	const v = packageJson.dependencies?.['@gongt/fix-esm'];
	if (v && !v.startsWith('workspace:')) {
		console.error('replace fix-esm version from %s to local file', v);
		packageJson.dependencies['@gongt/fix-esm'] = resolve(PROJECT_ROOT, '@gongt/fix-esm');
	}

	if (myProjects.has(packageJson.name)) return packageJson;

	if (packageJson.dependencies) lockDep(packageJson.dependencies, context);
	// if (packageJson.devDependencies) lockDep(packageJson.devDependencies, context);

	if (packageJson.peerDependencies) delete packageJson.peerDependencies;

	return packageJson;
}

function lockDep(deps, context) {
	for (const [name, version] of Object.entries(deps)) {
		if (!name.startsWith('@types/')) continue;

		if (knownTypesVersion[name]) {
			deps[name] = knownTypesVersion[name];
		} else {
			knownTypesVersion[name] = version;
		}
	}
}

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}
