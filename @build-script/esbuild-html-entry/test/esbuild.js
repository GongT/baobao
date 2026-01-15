import { ESBuildHtmlEntry } from '@gongt/esbuild-html-entry';
import esbuild from 'esbuild';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const watch = process.argv.includes('--watch');

async function main() {
	const outdir = resolve(rootDir, '../lib/test');

	console.log('[esbuild] start');
	console.log('    rootDir: %s', rootDir);
	console.log('    outDir: %s', outdir);

	const ctx = await esbuild.context({
		entryPoints: ['./index.html'],
		bundle: true,
		format: 'esm',
		minify: false,
		sourcemap: true,
		sourcesContent: true,
		platform: 'browser',
		outdir,
		logLevel: 'info',
		// tsconfig: './tsconfig.json',
		entryNames: '[name]-[hash]',
		// assetNames: production ? '[name]-[hash]' : '[name]',
		treeShaking: true,
		splitting: true,
		metafile: true,
		define: {
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		loader: {},
		plugins: [new ESBuildHtmlEntry()],
	});

	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		console.log('rebuild done.');
		await ctx.dispose();
	}
}

const rootDir = resolve(fileURLToPath(import.meta.url), '..');
process.chdir(rootDir);

main().catch((_e) => {
	// console.error(e);
	process.exit(1);
});
