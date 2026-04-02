/// <reference types="node" />

import esbuild from 'esbuild';
import { access, constants, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { makeConfig } from './config.js';

const outDir = resolve(import.meta.dirname, '../lib');
const outFile = resolve(outDir, 'exports.js');
const lockFile = resolve(process.platform === 'linux' ? '/dev/shm' : outDir, '.lock');

if (process.platform !== 'linux') {
	await mkdir(outDir, { recursive: true });
}

await main();

async function main() {
	let tries = 0;
	while (tries < 25) {
		const acquired = await promiseBoolean(mkdir(lockFile, {}));
		if (!acquired) {
			tries++;
			await new Promise((resolve) => setTimeout(resolve, 200));
			continue;
		}

		try {
			const exists = await promiseBoolean(access(outFile, constants.F_OK));
			if (exists) return;

			await make();
		} finally {
			await rm(lockFile, { recursive: true, force: true });
		}

		return;
	}

	// never acquired
	console.error('[ERROR] Cannot acquire lock file @ %s', lockFile);
	await make();
	await rm(lockFile, { recursive: true, force: true });
}

function promiseBoolean(promise) {
	return promise.then(
		() => true,
		() => false,
	);
}

async function make() {
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
			// 已经输出过了
			process.exit(23);
		}
		throw error;
	} finally {
		await session.dispose();
	}
}

/**
 * @param {import('esbuild').BuildFailure} error
 */
function printEsbuildError(error) {
	console.error(error);
}
