/// <reference types="node" />

import { defineEsbuild, type esbuild } from '@mpis/esbuild';
import { resolve } from 'node:path';

const ext = /\.ts$/;
const src = /^(\.\/)src\//;

await defineEsbuild('native-executer', async () => {
	const projectRoot = resolve(import.meta.dirname, '..');
	const { default: packageJson } = await import(resolve(projectRoot, 'package.json'), { with: { type: 'json' } });

	const entry: { in: string; out: string }[] = [];
	for (const [key, value] of Object.entries(packageJson.exports)) {
		if (key.endsWith('.json')) continue;

		if (typeof value !== 'string') throw new TypeError(`Invalid export entry for ${key}: expected string, got ${typeof value}`);

		const mapped = value.replace(ext, '').replace(src, './lib/');
		entry.push({
			in: resolve(projectRoot, value),
			out: resolve(projectRoot, mapped),
		});
	}

	const config: esbuild.BuildOptions = {
		absWorkingDir: projectRoot,
		entryPoints: entry,
		bundle: true,
		splitting: true,
		chunkNames: '[name]',
		platform: 'node',
		packages: 'external',
		outdir: 'lib',
	};
	console.log(config);

	return config;
});
