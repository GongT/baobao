/**
 * 此文件仅用于当前项目开发时，不会发布到npm
 *
 * 允许0编译运行任何文件。
 */
import debug from 'debug';
import esbuild from 'esbuild';
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
// @ts-expect-error
// biome-ignore lint/correctness/useImportExtensions: is ok
import { earlyLoaderState } from './common/early-loader-bridge.ts';

async function makeEverythingWorks() {
	const rootDir = resolve(import.meta.dirname, '..');
	const outDir = resolve(rootDir, 'lib/.early-loader');

	debug('executer:early-loader')(`编译底层加载器:
  - rootDir: ${rootDir}
  - entry: ${process.argv[1]}
  - trace:\n${new Error().stack?.replace(/^Error\n/, '').replace(/^/gm, '    ')}
`);

	return await withLock(outDir, () => mainJob(rootDir, outDir));
}

async function mainJob(rootDir: string, outDir: string) {
	if (earlyLoaderState.hookEntry) {
		throw new Error(`early-loader 已经被加载过了`);
	}

	const indexFile = 'src/index.ts';
	const workerFile = 'src/hook-worker.ts';

	let buildResult;
	try {
		buildResult = esbuild.buildSync({
			entryPoints: [indexFile, workerFile],
			absWorkingDir: rootDir,
			bundle: true,
			outdir: outDir,
			platform: 'node',
			format: 'esm',
			banner: {
				js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
/**
 * Why:
 *  - argv = "${process.argv.join('" "')}"
 *  - cwd = "${process.cwd()}"
 */`,
			},
			conditions: ['early-loader', 'esbuild', 'source', 'node', 'import', 'default'],
			sourcemap: 'linked',
			external: ['esbuild', 'source-map-support', 'source-map'],
			entryNames: '(entry)[name]-[hash]',
			splitting: false,
			minify: false,
			minifyIdentifiers: false,
			metafile: true,
			write: false,
			allowOverwrite: false,
		});
	} catch {
		console.error('[CRITICAL] 底层加载器编译失败');
		process.exit(1);
	}

	if (buildResult.outputFiles.length !== 4) {
		console.error(`[CRITICAL] 预期输出4个文件（.js/.js.map），实际得到${buildResult.outputFiles.length}个`);
		for (const file of buildResult.outputFiles) {
			console.error(`  - ${file.path}`);
		}
		process.exit(1);
	}

	const entryMap = new Map<string, string>();
	for (const [rel, meta] of Object.entries(buildResult.metafile.outputs)) {
		if (!meta.entryPoint) continue;

		const absolute = resolve(rootDir, rel);
		const outputData = buildResult.outputFiles.find((f) => f.path === absolute);
		if (!outputData) {
			console.error(`[CRITICAL] 输出文件未找到: ${absolute}`);
			process.exit(1);
		}
		entryMap.set(meta.entryPoint.replaceAll('\\', '/'), outputData.path);
	}

	function get(file: string) {
		const mapped = entryMap.get(file);
		if (!mapped) {
			console.error(`[CRITICAL] 编译结果中缺少预期的入口文件: ${file}`);
			for (const [entry, output] of entryMap.entries()) {
				console.error(`  - ${entry} => ${output}`);
			}
			process.exit(1);
		}
		return mapped;
	}

	const hookEntry = get(workerFile);
	const mainEntry = get(indexFile);

	earlyLoaderState.hookEntry = hookEntry;
	earlyLoaderState.mainEntry = mainEntry;

	for (const file of buildResult.outputFiles) {
		const target = resolve(rootDir, file.path);
		if (!existsSync(target)) {
			writeFileSync(target, file.contents);
		}
	}

	// Module.registerHooks({
	// 	resolve(specifier, context, defaultResolve) {
	// 		console.log('[early-loader] [%s] resolve <%s>', context.parentURL, specifier);
	// 		return defaultResolve(specifier, context);
	// 	},
	// });

	earlyLoaderState.exports = await import(mainEntry);
	return earlyLoaderState.exports;
}

async function withLock<T>(dir: string, callback: () => Promise<T>) {
	const lock = `${dir}/.lock`;
	mkdirSync(dirname(lock), { recursive: true });

	for (let i = 0; i < 10; i++) {
		// 每个循环等待500ms，最多等待5秒
		try {
			mkdirSync(lock);
			break;
		} catch (e) {
			if ((e as any).code === 'EEXIST') {
				// 已经存在，说明另一个进程正在写入，等待一会儿重试
				await new Promise((resolve) => setTimeout(resolve, 500));
			} else {
				console.error(`[CRITICAL] 无法创建编译结果锁定文件: ${lock}`);
				process.exit(1);
			}
		}
	}

	try {
		return await callback();
	} finally {
		try {
			rmdirSync(lock);
		} catch {}
	}
}

const imports = earlyLoaderState.exports ?? (await makeEverythingWorks());

export const execute = imports.execute;
export const dispose = imports.dispose;
export const importFile = imports.importFile;
export const getBuildInfo = imports.getBuildInfo;
