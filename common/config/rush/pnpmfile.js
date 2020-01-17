const { resolve } = require('path');

// this file will copy to common/temp before run
const template = resolve(__dirname, '../../@idlebox/typescript-transformer-dual-package/package.json');
console.warn('copy tsc version from %s', template);
const someTypescriptVersion = require(template).devDependencies.typescript;

function readPackage(packageJson, context) {
	// // The karma types have a missing dependency on typings from the log4js package.
	// if (packageJson.name === '@types/karma') {
	//  context.log('Fixed up dependencies for @types/karma');
	//  packageJson.dependencies['log4js'] = '0.6.38';
	// }

	if (fixDependencyIssue(packageJson)) {
		return packageJson;
	}

	if (!packageJson.devDependencies) {
		packageJson.devDependencies = {};
	}

	forceResolveSameVersion(packageJson);

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
		// console.warn('lock deps [%s] from [%s] version to [%s].', packageName, parent.name, version);
		parent.dependencies[packageName] = version;
	}
	if (parent.devDependencies && parent.devDependencies[packageName]) {
		// console.warn('lock devDeps [%s] from [%s] version to [%s].', packageName, parent.name, version);
		parent.devDependencies[packageName] = version;
	}
}

function fixDependencyIssue(packageJson) {
	switch (packageJson.name) {
		case 'npm-registry-fetch':
			packageJson.dependencies['safe-buffer'] = '^5.1.2';
			return;
		case 'npm-check-updates':
			packageJson.dependencies['package-json'] = '^6.4.0';
			return true;
		default:
			return false;
	}
}

module.exports = {
	hooks: {
		readPackage,
	},
};
