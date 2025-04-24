import { Emitter } from '@idlebox/common';
import { relativePath, writeFileIfChange } from '@idlebox/node';
import { watch as chokidar } from 'chokidar';
import { type BuildOptions, type BuildResult, context } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { RawSourceMap } from 'source-map-js';
import { createEntrypoints } from './esbuild/chunker.js';
import { resolveStylesPlugin } from './esbuild/css-resolver.js';
import { hackedScssBuildPlugin } from './esbuild/scss-hack.js';
import { entrySourceRoot, isProd, isVerbose, outputDir, projectRoot } from './library/constants.js';

const events = new Emitter<string | Error>();

const config: BuildOptions = {
	bundle: true,
	define: {
		'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
		isDebug: isProd ? 'false' : 'true',
	},
	platform: 'browser',
	absWorkingDir: projectRoot,
	outdir: outputDir,
	splitting: true,
	sourcemap: 'linked',
	sourceRoot: '/_assets/@src/',
	chunkNames: 'chunks/[name]-[hash]',
	entryNames: '[name]-[hash]',
	assetNames: '[name]-[hash]',
	// publicPath: '/_assets',
	sourcesContent: false,
	tsconfig: resolve(entrySourceRoot, 'tsconfig.json'),
	keepNames: true,
	format: 'esm',
	charset: 'utf8',
	write: false,
	metafile: true,
	plugins: [resolveStylesPlugin(), hackedScssBuildPlugin()],
};

// function removeRelativeToRoot(src: string) {
// 	if (!src.startsWith('support/entry/lib/')) {
// 		throw new Error('构建内部错误: 路径应该以support/entry/lib/开头: ' + src);
// 	}
// 	return src.substring('support/entry/lib/'.length);
// }

export async function runESBuild(watch: boolean) {
	const entry = createEntrypoints();
	// console.error(entry);

	// const pass1 = await build({ ...config,   entryPoints: entry });
	// for (const [fileRel, info] of Object.entries(pass1.metafile!.inputs)) {
	// 	if (fileRel.includes('/.pnpm/')) {
	// 	}
	// }
	// console.log(pass1);
	const ctx = await context({
		...config,
		logLevel: isVerbose ? 'verbose' : watch ? 'warning' : 'info',
		entryPoints: entry,
		write: false,
		metafile: true,
	});

	if (watch) {
		const result = await ctx.rebuild();
		writeOut(result);

		const inputs = Object.keys(result.metafile?.inputs);

		const watcher = chokidar(inputs, { ignoreInitial: true, atomic: true });
		watcher.on('all', async () => {
			try {
				const result = await ctx.rebuild();
				writeOut(result);
				const inputs = Object.keys(result.metafile?.inputs);
				watcher.add(inputs);
			} catch (e: any) {
				events.fireNoError(e);
			}
		});
	} else {
		const result = await ctx.rebuild();
		writeOut(result);
	}

	return events.register;
}

async function writeOut(dist: BuildResult) {
	for (const i of dist.outputFiles!) {
		await mkdir(dirname(i.path), { recursive: true });
		if (i.path.endsWith('.map')) {
			const sourcemap: RawSourceMap = JSON.parse(i.text);
			sourcemap.sources = sourcemap.sources.map((f) => relativePath(projectRoot, resolve(i.path, '..', f)));
			await writeFileIfChange(i.path, JSON.stringify(sourcemap));
		} else {
			await writeFileIfChange(i.path, Buffer.from(i.contents));
		}
	}

	// for (const [distPath, info] of Object.entries(dist.metafile!.outputs)) {
	// 	if (info.entryPoint === 'support/entry/src/app-main-entry-point.ts') {
	// 		// todo: dynamic
	// 		const result = removeRelativeToRoot(distPath);
	// 		events.fire(result);
	// 	}
	// }
}
