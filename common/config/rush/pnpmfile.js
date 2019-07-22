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
	
	if (forceResolveSameVersion(packageJson)) {
		return packageJson;
	}
	
	return packageJson;
}

function forceResolveSameVersion(packageJson) {
	if (packageJson.dependencies && packageJson.dependencies['typescript']) {
		packageJson.dependencies['typescript'] = 'latest';
	}
	if (packageJson.devDependencies && packageJson.devDependencies['typescript']) {
		packageJson.devDependencies['typescript'] = 'latest';
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
