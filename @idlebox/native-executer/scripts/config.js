import debug from 'debug';
import esbuild from 'esbuild';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const log = debug('executer:early-load');

export const outDir = resolve(import.meta.dirname, '../lib');
export const outFile = resolve(outDir, 'exports.js');

export function makeConfig() {
	const projectRoot = resolve(import.meta.dirname, '..');

	/**
	 * @type {{ in: string; out: string }[]}
	 */
	const entry = [
		{
			in: resolve(projectRoot, 'src/register-if-not.ts'),
			out: resolve(projectRoot, 'lib/register-if-not'),
		},
		{
			in: resolve(projectRoot, 'src/really-register.ts'),
			out: resolve(projectRoot, 'lib/really-register'),
		},
		{
			in: resolve(projectRoot, 'src/register-or-respawn.ts'),
			out: resolve(projectRoot, 'lib/register-or-respawn'),
		},
		{
			in: resolve(projectRoot, 'src/generate-prefix.ts'),
			out: resolve(projectRoot, 'lib/generate-prefix'),
		},
		{
			in: resolve(projectRoot, 'src/exports.ts'),
			out: resolve(projectRoot, 'lib/exports'),
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
		outdir: 'lib',
		format: 'esm',
		sourcemap: 'linked',
		sourcesContent: false,
	};

	return config;
}

export async function make() {
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
