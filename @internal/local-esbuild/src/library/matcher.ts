import type { Plugin } from 'esbuild';
import { isFastMode, isWatchMode } from './args.js';

export const esbuildProblemMatcherPlugin: Plugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		let firstRun = true;

		build.onStart(() => {
			if (firstRun) {
				firstRun = false;
			} else if (isWatchMode && isFastMode) {
				process.stderr.write('\x1Bc');
			}
			console.log('[esbuild] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location) {
					console.error(`    ${location.file}:${location.line}:${location.column}:`);
				}
			});
			console.log('[esbuild] build finished');
		});
	},
};
