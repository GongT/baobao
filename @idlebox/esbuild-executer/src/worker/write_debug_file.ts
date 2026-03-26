import type esbuild from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { logger } from './logger.js';

const tsExt = /\.ts\b/;

export function createDebugOutput(): esbuild.Plugin {
	return {
		name: 'write-debug-file',
		setup(build) {
			build.onEnd((result) => {
				if (!result.outputFiles) {
					throw new Error('esbuild did not produce output files');
				}

				let folder_found = null as string | null;
				for (const file of result.outputFiles) {
					// logger.esbuild`receive compiled file: ${file.path}`;
					const dir = dirname(file.path);
					const base = `${basename(file.path).replace(tsExt, '.js')}`;

					if (!folder_found) {
						folder_found = `${dir}/.debug`;
					}

					mkdirSync(`${dir}/.debug`, { recursive: true });
					const temp = `${dir}/.debug/${base}`;
					logger.output`write debug file to ${temp}`;
					writeFileSync(temp, file.contents);
				}

				if (folder_found) {
					logger.output`write debug file to ${folder_found}/.metafile.json`;
					writeFileSync(`${folder_found}/.metafile.json`, JSON.stringify(result.metafile, null, 4));
				}
			});
		},
	};
}

export function createInspectOutput(outDir: string): esbuild.Plugin {
	return {
		name: 'write-inspect-file',
		setup(build) {
			build.onEnd((result) => {
				if (!result.outputFiles) {
					throw new Error('esbuild did not produce output files');
				}

				for (const file of result.outputFiles) {
					// logger.esbuild`receive compiled file: ${file.path}`;

					logger.esbuild`write inspect file to ${file.path}`;
					writeFileSync(file.path, file.contents);
				}

				logger.esbuild`write inspect file to ${outDir}/.metafile.json`;
				writeFileSync(`${outDir}/.metafile.json`, JSON.stringify(result.metafile, null, 4));
			});
		},
	};
}
