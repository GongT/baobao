import { resolve } from 'path';
import { normalizePath } from '@idlebox/common';
import { BuildOptions } from 'esbuild';

interface FilterdBuildOptions extends BuildOptions {
	outfile: never;
	outdir: string;
}

function required(options: BuildOptions, key: keyof BuildOptions) {
	if (typeof options[key] === 'undefined') throw new Error(key + ' is required');
}
function denied(options: BuildOptions, key: keyof BuildOptions) {
	if (typeof options[key] !== 'undefined') throw new Error(key + ' is denied');
}

export function filterOptions(rootDir: string, options: BuildOptions): FilterdBuildOptions {
	required(options, 'outdir');
	required(options, 'entryPoints');
	required(options, 'publicPath');

	denied(options, 'outfile');
	denied(options, 'absWorkingDir');

	options = Object.assign({}, defaultOptions, options);
	options.loader = Object.assign({}, defaultOptions.loader, options.loader);

	const outputDir = normalizePath(resolve(rootDir, './' + options.outdir));
	if (!outputDir.startsWith(rootDir)) {
		throw new Error('output dirctory is out of root: ' + outputDir);
	}
	if (outputDir === rootDir) {
		throw new Error('output dirctory is root: ' + options.outdir);
	}
	options.outdir = outputDir;
	options.absWorkingDir = rootDir;

	return options as any;
}

const defaultOptions: BuildOptions = {
	bundle: true,
	splitting: false,
	platform: 'browser',
	assetNames: 'assets/[name][ext]',
	mainFields: ['browser', 'module', 'main'],
	conditions: ['browser', 'import', 'default'],
	resolveExtensions: ['.ts', '.tsx', '.js'],
	external: ['electron', 'node:*'],
	loader: {
		'.png': 'file',
		'.svg': 'text',
		'.woff2': 'file',
		'.woff': 'file',
		'.ttf': 'file',
		'.eot': 'file',
	},
	sourcemap: 'linked',
	sourceRoot: 'app://debug/',
	sourcesContent: false,
	write: true,
	metafile: true,
	keepNames: true,
	format: 'cjs',
	charset: 'utf8',
	target: 'esnext',
	// plugins: [
	// 	// SkipElectronPlugin(),
	// 	ScssCombinePlugin(session, {
	// 		// TODO
	// 		sourceRoot: './src',
	// 	}),
	// ],
};
