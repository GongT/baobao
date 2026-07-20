/// <reference types="node" />

import debug from 'debug';
import esbuild from 'esbuild';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

	let hasError;

	options.logLevel = 'silent';
	options.plugins = [
		{
			name: 'loader-hooks',
			setup(build) {
				build.onEnd((result) => {
					hasError = false;
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

	if (!process.env.CI) {
		developmentMode(options);
	}

	const session = await esbuild.context(options);

	try {
		await session.rebuild();
	} catch (error) {
		if (hasError) {
			// 信息已经输出过了，直接退出
			process.exit(23);
		}
		throw error;
	} finally {
		await session.dispose();
		log(`构建自身使用了 ${Date.now() - start}ms`);
	}
}

function developmentMode(options) {
	options.write = false;
	options.plugins.push({
		name: 'on-change-writer',
		setup(build) {
			assert.ok(build.initialOptions.outdir, 'outdir is required');
			assert.ok(build.initialOptions.absWorkingDir, 'absWorkingDir is required');
			assert.equal(resolve(build.initialOptions.absWorkingDir, build.initialOptions.outdir), outDir);
			const cache_file = resolve(outDir, '.esbuild-self-cache.json');

			build.onEnd((result) => {
				let changes = false;

				const infoFile = readJsonFile(cache_file);
				if (!infoFile.hash) infoFile.hash = {};

				const memoryFiles = {};
				for (const output of result.outputFiles) {
					memoryFiles[output.path] = output.hash;
				}

				for (const path of Object.keys(infoFile.hash)) {
					if (memoryFiles[path]) continue;

					log(`删除过期文件: ${path}`);
					try {
						unlinkSync(path);
					} catch (error) {
						log(`删除过期文件失败: ${path}`, error);
					}

					delete infoFile.hash[path];
					changes = true;
				}

				for (const output of result.outputFiles) {
					if (infoFile.hash[output.path] === output.hash) continue;

					log(`写入文件: ${output.path}`);
					mkdirSync(resolve(output.path, '..'), { recursive: true });
					writeFileSync(output.path, output.contents);

					infoFile.hash[output.path] = output.hash;
					changes = true;
				}

				if (changes) {
					log(`写入缓存文件: ${cache_file}`);
					infoFile.last_change = Date.now();
					writeFileSync(cache_file, JSON.stringify(infoFile, null, 2));
				}
			});
		},
	});
}

/**
 * @param {import('esbuild').BuildFailure} error
 */
function printEsbuildError(error) {
	console.error(error);
}

function readJsonFile(path, defaultValue = {}) {
	if (!existsSync(path)) {
		return defaultValue;
	}
	const content = readFileSync(path, 'utf-8');
	return JSON.parse(content);
}
