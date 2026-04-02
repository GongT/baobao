/// <reference types="node" />

import esbuild from 'esbuild';
import { makeConfig } from './config.js';

const options = makeConfig();

let hasError = false;

options.logLevel = 'silent';
options.plugins = [
	{
		name: 'loader-hooks',
		setup(build) {
			build.onEnd((result) => {
				if (Array.isArray(result.warnings) && result.warnings.length) {
					hasError = true;
					result.warnings.forEach(printEsbuildError);
				}
				if (Array.isArray(result.errors) && result.errors.length) {
					hasError = true;
					result.errors.forEach(printEsbuildError);
				}
			});
		},
	},
];

const session = await esbuild.context(options);

try {
	await session.rebuild();
} catch (error) {
	if (hasError) {
		process.exit(23);
	}

	throw error;
} finally {
	await session.dispose();
}

/**
 * @param {import('esbuild').BuildFailure} error
 */
function printEsbuildError(error) {
	console.error(error);
}
