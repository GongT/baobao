import type esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import type Module from 'node:module';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import lockfile from 'proper-lockfile';

function sleepSync(seconds: number) {
	execSync(`sleep ${seconds}`);
}

interface ILoaderOptions {
	readonly dist: string;
	readonly src: string;
	readonly check?: boolean;
	readonly force: boolean;
	readonly external?: string[];

	debug: boolean;
	distAbs: string;
	actualAbs: string;
}
export default function load(module: Module, options: ILoaderOptions) {
	options.distAbs = resolve(module.path, options.dist);
	options.debug = process.argv.includes('--debug');

	mkdirSync(dirname(options.distAbs), { recursive: true });

	let release: CallableFunction | undefined;
	while (!release) {
		try {
			release = lockfile.lockSync(options.distAbs, { stale: 20000, realpath: false });
		} catch (e: any) {
			if (e?.code === 'ELOCKED') {
				sleepSync(1);
				continue;
			}
			throw e;
		}
	}
	try {
		/*
			need to write to disk, otherwise support source-map is hard
			so the entire process must be locked
		*/
		if (options.force) {
			load_compile(module, options);
		} else {
			if (existsSync(options.distAbs)) {
				load_exists(module, options);
			} else {
				load_compile(module, options);
			}
		}
	} catch (e: any) {
		console.error(e?.stack.replace(/^/gm, '[heft-plugin-base/loader] '));
	} finally {
		release();
	}

	check_load(module, options);
}

function interop(module: Module) {
	return module.exports.__esModule ? module.exports.default : module.exports;
}

function check_load(module: Module, options: ILoaderOptions) {
	if (options.check !== false) {
		const construct = interop(module);
		if (!construct) {
			console.error(`module (${options.actualAbs}) export seems wrong:`);
			console.error(
				`    exports.__esModule = ${module.exports.__esModule}; all names: ${Object.keys(module.exports).join(', ')}`
			);
			console.error(
				`    class: ${construct
					?.toString()
					.slice(0, 80)
					.replace(/\s*\n\s*/m, ' ')} ...`
			);
		}
	}
}

function load_exists(module: Module, options: ILoaderOptions) {
	options.actualAbs = options.distAbs;
	module.exports = module.require(options.distAbs);
}
function load_compile(module: Module, options: ILoaderOptions) {
	const sourceFile = resolve(module.path, options.src);
	options.actualAbs = sourceFile;

	const distFile = resolve(module.path, `${options.dist.replace(/\.[cm]?js/, '')}.realtime-compile.cjs`);

	if (is_too_young(distFile)) {
		if (options.debug) {
			console.log(
				'[heft-plugin-base/loader] realtime compile is too frequent, use disk version.',
				options.force ? '(forced)' : ''
			);
		}
	} else {
		if (options.debug) {
			console.log(`[heft-plugin-base/loader] compile heft plugin: ${sourceFile}`, options.force ? '(forced)' : '');
		}
		realtime_compule(sourceFile, distFile, module.path, options);
	}

	try {
		module.exports = module.require(distFile);
	} catch (e) {
		if (options.debug) {
			console.log(`[heft-plugin-base/loader] failed require: ${distFile}`);
		}
		throw e;
	}
}

function is_too_young(file: string) {
	try {
		const ss = statSync(file);
		if (Date.now() - ss.mtimeMs < 5000) {
			return true;
		}
	} catch {}
	return false;
}

function realtime_compule(sourceFile: string, distFile: string, buildRoot: string, options: ILoaderOptions) {
	const esb: typeof esbuild = getEsbuild(buildRoot);
	try {
		const result = esb.buildSync({
			entryPoints: [sourceFile],
			platform: 'node',
			bundle: true,
			format: 'cjs',
			minify: false,
			sourcemap: true,
			assetNames: '[name]',
			define: {
				'process.env.IS_REALTIME_BUILD': 'true',
			},
			external: ['typescript', 'esbuild', 'tslib', ...(options.external ?? [])],
			treeShaking: true,
			outfile: distFile,
			conditions: ['source', 'module', 'default'],
			// write: false,
		});

		if (result.errors.length || result.warnings.length) {
			const entry = Object.values(result.metafile?.outputs ?? {}).find((e) => e.entryPoint)?.entryPoint;
			console.error(`esbuild compile with errors (while bundle ${entry}):`);
		}

		for (const { text, location } of result.errors) {
			console.error(`✘ [ERROR] ${text}`);
			if (location) {
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			}
		}
		for (const { text, location } of result.warnings) {
			console.error(`✘ [WARN] ${text}`);
			if (location) {
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			}
		}
		if (result.errors.length) {
			throw new Error('can not compile source file');
		}
	} catch (e) {
		console.error(`esbuild failed to execute compile (entry: ${sourceFile})`);
		throw e;
	}
}

function getEsbuild(parent: string) {
	const require = createRequire(`${parent}/package.json`);
	try {
		return require('esbuild');
	} catch (e: any) {
		if (e.code === 'MODULE_NOT_FOUND' || e.code === 'ERR_MODULE_NOT_FOUND') {
			console.error('[heft-plugin-base/loader] esbuild is not installed, trying to install it');
			console.error('[heft-plugin-base/loader] it should install inside: %s', parent);
		} else {
			console.error('[heft-plugin-base/loader] failed require esbuild.');
		}
		throw e;
	}
}
