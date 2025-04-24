import { relativePath } from '@idlebox/node';
import type { OnLoadResult, Plugin } from 'esbuild';
import sassPlugin from 'esbuild-sass-plugin';
import scopeCss from 'scope-css';
import { projectRoot } from '../library/constants.js';
import { rush } from '../library/rush.js';
import { hash, normalizePackageName } from './library.js';

console.error('postcss.config.js loaded');

const nameCache: Record<string, string> = {};
function createUniqueName(filename: string, content: string) {
	if (!nameCache[filename]) {
		nameCache[filename] = `${normalizePackageName(
			relativePath(projectRoot, filename)
				.replace(/\.scss/, '')
				.replace('/src/', '/')
		)}_${hash(content)}`;
	}
	return nameCache[filename]!;
}

// export function scssBuildPlugin(): Plugin {
// 	return {
// 		name:'my-scss-compile',
// 		setup(build) {
// 			build.onResolve(options, callback)
// 		},
// 	}
// }

export function hackedScssBuildPlugin(): Plugin {
	const styleLib = rush.absolute('@moffett/style', 'scss');

	const plugin = sassPlugin({
		basedir: projectRoot,
		includePaths: ['.', styleLib],
		cache: true,
		transform(cssText: string, _resolveDir: string, filePath: string): OnLoadResult {
			const parentName = createUniqueName(filePath, cssText);
			const wrappedCss = scopeCss(cssText, `.${parentName}`);

			return {
				contents: JSON.stringify({ style: wrappedCss, scope: parentName }),
				loader: 'json',
			};
		},
	});

	return plugin;
}
