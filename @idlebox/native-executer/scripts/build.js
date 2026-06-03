/// <reference types="node" />

import debug from 'debug';
import esbuild from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import lockfile from 'proper-lockfile';
import { makeConfig } from './config.js';

const log = debug('executer:early-load');
const logCi = debug('ci:executer:early-load');
const outDir = resolve(import.meta.dirname, '../lib');
const outFile = resolve(outDir, 'exports.js');

await main();

async function main() {
	logCi(`需要通过native-executer构建并加载自身`);
	await mkdir(outDir, { recursive: true });

	const release = await lockfile.lock(outDir, {
		retries: {
			factor: 1,
		},
	});

	logCi(`成功获取锁`);

	try {
		if (existsSync(outFile)) {
			if (process.env.__RELAUNCH__) {
				log(`输出文件存在，重新启动状态跳过重生成`);
				return;
			} else if (process.env.CI) {
				log(`CI环境，跳过重生成`);
				return;
			} else {
				log(`输出文件存在: ${outFile} (开发模式强制重新生成)`);
			}
		} else {
			logCi(`输出文件不存在，需要构建`);
		}

		await make();
	} finally {
		await release();
	}
}

async function make() {
	const start = Date.now();
	log('native-executer 构建自身');
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
		log(`构建自身使用了 ${Date.now() - start}ms`);
	}
}

/**
 * @param {import('esbuild').BuildFailure} error
 */
function printEsbuildError(error) {
	console.error(error);
}
