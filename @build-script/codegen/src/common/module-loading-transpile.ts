import { install } from '@idlebox/source-map-support';
import esbuild from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import module, { builtinModules, createRequire, findPackageJSON, type LoadFnOutput, type LoadHookContext } from 'node:module';
import { basename, dirname } from 'node:path';
import { Logger, type ILogger } from './output.js';

const builtinModulesWithPrefix = builtinModules.map((m) => `node:${m}`);

// const isAbsolute = /^[^.]/;
// const isDistFile = /\.[mc]?js$/;
const schema = /^file:\/\//;
const selfReference = import.meta.resolve('#self-reference');
const fileExtension = /\.ts$/;

export type IOptions = esbuild.BuildOptions & { write: false; metafile: true };
const compiledMemory = new Map<string, Uint8Array>();
const sourceMapMemory = new Map<string, any>();

export async function createEsbuildContext(absInputFile: string, packageFile: string, logger: ILogger) {
	const bannerCode = [
		`const require = (await import("node:module")).createRequire(import.meta.dirname);`,
		`import { Logger } from '${selfReference}';`,
		`const logger = Logger('${logger.title}');`,
	];

	const files = new Set<string>();
	function removeMemory() {
		for (const file of files) {
			compiledMemory.delete(file);
		}
		files.clear();
	}

	const pkgJson = JSON.parse(readFileSync(packageFile, 'utf-8'));
	const devDependencies = Object.keys(pkgJson.devDependencies ?? {});

	const plugin: esbuild.Plugin = {
		name: 'codegen-core',
		setup(build) {
			build.onStart(() => {
				removeMemory();
			});
			build.onEnd((result: esbuild.BuildResult<IOptions>) => {
				if (!result.metafile) {
					return; // something has failed
				}
				for (const file of result.outputFiles) {
					if (file.path.endsWith('.map')) {
						sourceMapMemory.set(file.path.slice(0, -4), JSON.parse(file.text));
					} else {
						compiledMemory.set(file.path, file.contents);
						files.add(file.path);
						if (debugMode) {
							const base = basename(file.path);
							const path = dirname(file.path);
							const out = `${path}/.${base.replace(fileExtension, '.js')}`;

							logger.verbose(`write out file for debugging: ${out}`);
							writeFileSync(out, file.contents);
						}
					}
				}
			});

			// build.onResolve({ filter: isAbsolute, namespace: 'file' }, async (args) => {
			// 	try {
			// 		const result = await build.resolve(args.path, args);
			// 		if (result.path && isDistFile.test(result.path)) {
			// 			return { external: true, pluginName: 'external-resolver' };
			// 		}
			// 	} catch {}
			// 	return;
			// });
		},
	};

	const context = await esbuild.context<IOptions>({
		write: false,
		metafile: true,
		bundle: true,
		sourcemap: 'linked',
		// sourceRoot: '@@@@@/', //
		entryPoints: [absInputFile],
		external: [...builtinModules, ...builtinModulesWithPrefix, '@build-script/codegen', ...devDependencies],
		absWorkingDir: dirname(packageFile),
		format: 'esm',
		platform: 'node',
		conditions: ['source', 'module', 'default'],
		outfile: absInputFile,
		legalComments: 'none',
		banner: {
			js: bannerCode.join(''),
		},
		loader: {
			'.ts': 'ts',
			'.js': 'ts',
		},
		define: {
			__filename: 'import.meta.filename',
			__dirname: 'import.meta.dirname',
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
		},
		plugins: [plugin],
		tsconfigRaw: {
			compilerOptions: {},
		},
	});

	const originalDispose = context.dispose.bind(context);
	return Object.assign(context, {
		async dispose() {
			await originalDispose();
			removeMemory();
		},
	});
}

import { fileURLToPath } from 'node:url';
import { debugMode, verboseMode } from './shared.js';
export function registerModuleLoader() {
	const logger = Logger('loader');

	const activated = install({
		retrieveSourceMap(source) {
			if (source.includes('?')) {
				logger.verbose(`source map: ${source}`);
				const [path] = source.replace(schema, '').split('?');
				const mapData = sourceMapMemory.get(path);
				if (mapData) {
					logger.verbose(`exists source map for: ${path}`);

					// console.log(mapData.buffer);
					return {
						map: mapData,
					};
				} else {
					logger.error(`missing source map for: ${path}`);

					if (verboseMode) {
						for (const key of sourceMapMemory.keys()) {
							logger.verbose(key);
						}
					}
				}
			}
			return null;
		},
	});
	if (!activated) {
		logger.warn('source map support is disabled');
	}

	module.registerHooks({
		// resolve(specifier, context, nextResolve) {
		// 	if (context.importAttributes.my_loader === 'compiled') {
		// 		logger.verbose(`resolve ${specifier}`);
		// 		const [path] = specifier.split('?');
		// 		if (!compiledMemory.has(path)) {
		// 			throw new Error(`module not found in compiled memory: ${specifier}`);
		// 		}
		// 		return nextResolve(path, context);
		// 	}
		// 	logger.verbose(`try resolve: ${specifier}`);
		// 	return nextResolve(specifier, context);
		// },
		load(url, context, nextLoad) {
			if (context.importAttributes?.my_loader === 'compiled') {
				const [path] = url.replace(schema, '').split('?');
				logger.verbose(`load memory: ${url}`);
				return {
					format: 'module',
					source: compiledMemory.get(path),
					shortCircuit: true,
				};
			}
			logger.verbose(`try load ${context.format}: ${url}`);
			try {
				return nextLoad(url, context);
			} catch (e) {
				const r = manualLoad(logger, url, context);
				if (!r) throw e;
				return r;
			}
		},
	});
}

function manualLoad(logger: ILogger, url: string, context: LoadHookContext): undefined | LoadFnOutput {
	const path = fileURLToPath(url);
	if (!existsSync(path)) {
		logger.error(`manual load missing file: ${url}`);
		return undefined;
	}

	let t: string;
	if (context.format) {
		t = context.format;
	} else {
		const pkgJsonPath = findPackageJSON(url);

		if (!pkgJsonPath) {
			logger.error(`manual load no package.json: ${path}`);
			return undefined;
		}

		const require = createRequire(path);
		const pkgJson = require(pkgJsonPath);

		t = pkgJson.type || 'commonjs';
	}

	return {
		format: t,
		shortCircuit: true,
		source: readFileSync(path),
	};
}
