import { resolve } from 'path';
import { normalizePath } from '@idlebox/common';
import { BuildOptions } from 'esbuild';

export interface FilterdBuildOptions extends BuildOptions {
	outfile: never;
	outdir: string;
	write: false;
	metafile: true;
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

	denied(options, 'outfile');
	denied(options, 'absWorkingDir');

	options = Object.assign({}, defaultOptions, options);
	options.loader = Object.assign({}, defaultOptions.loader, options.loader);

	if (options.platform === 'browser') {
		options.mainFields = ['browser', 'module', 'main'];
		options.conditions = ['browser', 'import', 'default'];
	} else if (options.platform === 'node') {
	}

	const outputDir = normalizePath(resolve(rootDir, './' + options.outdir));
	if (!outputDir.startsWith(rootDir)) {
		throw new Error('output dirctory is out of root: ' + outputDir);
	}
	if (outputDir === rootDir) {
		throw new Error('output dirctory is root: ' + options.outdir);
	}
	options.outdir = outputDir;
	options.absWorkingDir = rootDir;

	options.write = false;
	options.metafile = true;

	return options as any;
}

const defaultOptions: BuildOptions = {
	bundle: true,
	splitting: false,
	platform: 'browser',
	assetNames: 'assets/[name][ext]',
	resolveExtensions: ['.ts', '.tsx', '.js'],
	external: ['electron'],
	loader: {
		'.xml': 'text',
		'.txt': 'text',
		'.md': 'text',

		'.png': 'dataurl',
		'.ico': 'dataurl',
		'.gif': 'file',
		'.jpg': 'file',
		'.jpeg': 'file',
		'.webp': 'file',
		'.svg': 'text',

		'.woff2': 'file',
		'.woff': 'file',
		'.ttf': 'file',
		'.eot': 'file',
		'.otf': 'file',
		'.sfnt': 'file',
	},
	sourcemap: 'linked',
	sourcesContent: false,
	keepNames: true,
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
