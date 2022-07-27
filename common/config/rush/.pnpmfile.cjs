const { resolve } = require('path');
const { readFileSync } = require('fs');

const PROJECT_ROOT = resolve(__dirname, '../../..');

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}

function readPackage(packageJson, context) {
	if (packageJson.dependencies) lockDep(packageJson.name, packageJson.dependencies, context);
	if (packageJson.devDependencies) lockDep(packageJson.name, packageJson.devDependencies, context);

	if (packageJson.peerDependencies) delete packageJson.peerDependencies;

	fixDependencyIssue(packageJson);

	return packageJson;
}

function forceVersion(parent, packageName, version) {
	if (parent.dependencies && parent.dependencies[packageName] && parent.dependencies[packageName] !== version) {
		console.warn('Force [%s] from [%s] to [%s].', packageName, parent.name, version);
		parent.dependencies[packageName] = version;
	}
	if (
		parent.devDependencies &&
		parent.devDependencies[packageName] &&
		parent.devDependencies[packageName] !== version
	) {
		console.warn('Force [%s] from [%s] to [%s].', packageName, parent.name, version);
		parent.devDependencies[packageName] = version;
	}
}

function fixDependencyIssue(packageJson) {
	switch (packageJson.name) {
		// case 'npm-registry-fetch':
		// 	packageJson.dependencies['safe-buffer'] = '^5.1.2';
		// 	return;
		// case 'npm-check-updates':
		// 	packageJson.dependencies['package-json'] = '^6.4.0';
		// 	return;
		case '@microsoft/api-extractor':
			forceVersion(packageJson, 'source-map', '~0.6.1');
			return;
		default:
			return;
	}
}

const lockedDeps = {};
(() => {
	const reProjectFolder = /"projectFolder": "(.+)"/g;
	const content = readFileSync(resolve(PROJECT_ROOT, 'rush.json'), 'utf-8');
	let projectFolder;
	const myProjects = new Set();
	while ((projectFolder = reProjectFolder.exec(content))) {
		const p = resolve(PROJECT_ROOT, projectFolder[1], 'package.json');
		const val = loadJsonSync(p);
		myProjects.add(val.name);
		Object.assign(lockedDeps, val.dependencies, val.devDependencies);
	}
	for (const item of myProjects.values()) {
		delete lockedDeps[item];
	}
})();

function lockDep(pkgName, deps, context) {
	for (const [name, version] of Object.entries(deps)) {
		if (!lockedDeps[name]) {
			continue;
		}

		if (name.startsWith('@types/')) {
			deps[name] = lockedDeps[name];
			// if (lockedDeps[name] !== version) context.log(` * lock [${name}] of [${pkgName}] from [${version}] to [${lockedDeps[name]}].`);
		} else {
			// lockedDeps[name] = version;
		}
	}
}

module.exports = {
	hooks: {
		readPackage,
	},
};
