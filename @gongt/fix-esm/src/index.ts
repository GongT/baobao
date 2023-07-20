import { existsSync, readFileSync } from 'fs';
import esbuild from 'esbuild';

const sym = Symbol.for('fix-esm');
const Module = require('module') as any;

function executeBuild(filename: string) {
	const code = readFileSync(filename, 'utf8');
	const result = esbuild.buildSync({
		stdin: {
			contents: code,
			loader: 'js',
		},
		outfile: filename + 'c',
		format: 'cjs',
		sourcemap: 'inline',
		write: true,
	});
	if (result.errors.length) {
		throw new Error('[fix-esm] compile failed: ' + result.errors[0].text);
	}
	return readFileSync(filename + 'c', 'utf-8');
}

let originalLoader: typeof wrappedLoader;

function wrappedLoader(mod: any, filename: string) {
	if (filename.endsWith('.mjs')) return buildLoader(mod, filename);

	try {
		// console.error('[fix-esm] try: %s', filename);
		return originalLoader(mod, filename);
	} catch (error: any) {
		// console.log('[fix-esm] error!', error.message);
		if (
			error &&
			(error.code === 'ERR_REQUIRE_ESM' ||
				/^Cannot use (import|export) statement outside a module/.test(error.message))
		) {
			if (existsSync(filename + 'c')) {
				return originalLoader(mod, filename + 'c');
			}
			return buildLoader(mod, filename);
		}
		throw error;
	}
}

function buildLoader(mod: any, filename: string) {
	console.error('[fix-esm] realtime compile: %s', filename);
	// console.error('          cache items: %s', Object.keys(Module ._cache).length);
	let transpiledCode = executeBuild(filename);

	mod._compile(transpiledCode, filename);
	mod.loaded = true;
}

if (!Module[sym]) {
	originalLoader = Module._extensions['.js'];
	Module._extensions['.js'] = wrappedLoader;
	Module._extensions['.mjs'] = wrappedLoader;
	Module[sym] = originalLoader;
}
