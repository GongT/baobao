module.exports = {
	hooks: {
		readPackage,
	},
};

function readPackage(packageJson, context) {
	// // The karma types have a missing dependency on typings from the log4js package.
	// if (packageJson.name === '@types/karma') {
	//  context.log('Fixed up dependencies for @types/karma');
	//  packageJson.dependencies['log4js'] = '0.6.38';
	// }

	if (fixDependencyIssue(packageJson)) {
		return packageJson;
	}

	forceResolveSameVersion(packageJson);

	return packageJson;
}

function forceResolveSameVersion(packageJson) {
	forceVersion(packageJson, 'typescript', '3.7.4');
}

function forceVersion(parent, packageName, version) {
	if (parent.dependencies && parent.dependencies['typescript']) {
		// console.warn('lock deps [%s] from [%s] version to [%s].', packageName, parent.name, version);
		parent.dependencies[packageName] = version;
	}
	if (parent.devDependencies && parent.devDependencies['typescript']) {
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
