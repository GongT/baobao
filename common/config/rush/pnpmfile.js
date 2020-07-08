const { resolve } = require('path');
const { readFileSync } = require('fs');

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}

// this file will copy to common/temp before run
const template = resolve(__dirname, '../../@build-script/typescript-transformer-dual-package/package.json');
console.warn('copy tsc version from %s', template);
const someTypescriptVersion = loadJsonSync(template).devDependencies.typescript;

function readPackage(packageJson, context) {
	if (packageJson.dependencies) lockDep(packageJson.name, packageJson.dependencies, context);
	if (packageJson.devDependencies) lockDep(packageJson.name, packageJson.devDependencies, context);

	if (packageJson.peerDependencies) delete packageJson.peerDependencies;

	fixDependencyIssue(packageJson);

	// forceResolveSameVersion(packageJson);

	return packageJson;
}

function forceResolveSameVersion(packageJson) {
	if (!packageJson.name.startsWith('@rush-temp/')) {
		forceVersion(packageJson, 'typescript', someTypescriptVersion);
	}
	forceVersion(packageJson, 'once', 'latest');
}

function forceVersion(parent, packageName, version) {
	if (parent.dependencies && parent.dependencies[packageName]) {
		console.warn('Force [%s] from [%s] to [%s].', packageName, parent.name, version);
		parent.dependencies[packageName] = version;
	}
	if (parent.devDependencies && parent.devDependencies[packageName]) {
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
	const content = readFileSync(resolve(__dirname, '../../rush.json'), 'utf-8');
	let projectFolder;
	while ((projectFolder = reProjectFolder.exec(content))) {
		const p = resolve(__dirname, '../../', projectFolder[1], 'package.json');
		const val = loadJsonSync(p);
		Object.assign(lockedDeps, val.dependencies, val.devDependencies);
	}
})();

function lockDep(pkgName, deps, context) {
	for (const [name, version] of Object.entries(deps)) {
		if (lockedDeps[name] && lockedDeps[name] !== version) {
			context.log(` * lock [${name}] of [${pkgName}] from [${version}] to [${lockedDeps[name]}].`);

			deps[name] = lockedDeps[name];
		}
	}
}

module.exports = {
	hooks: {
		readPackage,
	},
};
