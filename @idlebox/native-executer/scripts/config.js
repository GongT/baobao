import { resolve } from 'node:path';

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
		chunkNames: '[name]',
		platform: 'node',
		packages: 'external',
		outdir: 'lib',
		format: 'esm',
		sourcemap: 'linked',
		sourcesContent: false,
	};

	return config;
}
