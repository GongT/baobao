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
	switch (packageJson.name) {
	case 'npm-registry-fetch':
		packageJson.dependencies['safe-buffer'] = '^5.1.2';
		break;
	case 'npm-check-updates':
		packageJson.dependencies['package-json'] = '^6.4.0';
		break;
	}
	
	return packageJson;
}

