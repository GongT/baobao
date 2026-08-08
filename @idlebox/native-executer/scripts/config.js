import debug from 'debug';
import esbuild from 'esbuild';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { exclusiveLock } from './exclusive-lock.js';

const log = debug('executer:e:config');
const projectRoot = resolve(import.meta.dirname, '..');
const defaultLib = 'lib';

export function distResolver(outDir = defaultLib) {
	return (...components) => {
		const r = resolve(projectRoot, outDir, ...components);

		const rel = relative(projectRoot, r);
		assert.ok(!rel.startsWith('..'), `路径异常，离开当前包: ${r}`);
		if (rel.startsWith('.') && rel.includes('/')) {
			// ok
		} else if (rel.startsWith(`${defaultLib}/`) || rel === defaultLib) {
			// ok
		} else {
			throw new Error(`路径异常，不在合理路径下: ${rel}`);
		}

		return r;
	};
}

export function makeConfig(outDir = defaultLib) {
	const resolveDist = distResolver(outDir);
	/**
	 * @type {{ in: string; out: string }[]}
	 */
	const entry = [
		{
			in: resolve(projectRoot, 'src/register-if-not.ts'),
			out: resolveDist('register-if-not'),
		},
		{
			in: resolve(projectRoot, 'src/really-register.ts'),
			out: resolveDist('really-register'),
		},
		{
			in: resolve(projectRoot, 'src/register-or-respawn.ts'),
			out: resolveDist('register-or-respawn'),
		},
		{
			in: resolve(projectRoot, 'src/generate-prefix.ts'),
			out: resolveDist('generate-prefix'),
		},
		{
			in: resolve(projectRoot, 'src/exports.ts'),
			out: resolveDist('exports'),
		},
	];

	/**
	 * @type {import('esbuild').BuildOptions}
	 */
	const config = {
		absWorkingDir: projectRoot,
		entryPoints: entry,
		bundle: true,
		splitting: true,
		minify: false,
		chunkNames: 'chunks/[name]-[hash]',
		platform: 'node',
		packages: 'external',
		outdir: resolveDist(),
		format: 'esm',
		sourcemap: 'linked',
		sourcesContent: false,
	};

	return config;
}

export async function make(outDir = defaultLib) {
	const start = Date.now();
	log('native-executer 构建自身');
	const options = makeConfig(outDir);

	let hasError;

	options.logLevel = 'silent';
	options.plugins = [
		{
			name: 'exclusive-lock',
			setup(build) {
				let unlock;
				build.onStart(async () => {
					try {
						unlock = await exclusiveLock();
					} catch (e) {
						e.message = e.stack;
						e.stack = undefined;
					}
				});
				build.onEnd(async () => {
					if (unlock) {
						await unlock();
					}
				});
			},
		},
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

	function developmentMode(options) {
		options.write = false;
		options.plugins.push({
			name: 'on-change-writer',
			setup(build) {
				assert.ok(build.initialOptions.outdir, 'outdir 值异常');
				assert.ok(build.initialOptions.absWorkingDir, 'absWorkingDir 值异常');
				const cache_file = resolve(build.initialOptions.outdir, '.esbuild-self-cache.json');

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
