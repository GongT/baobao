import { parseExportsField, type IExportCondition } from '@idlebox/common';
import esbuild from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'fs';

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

function isNodeError(e: unknown): e is NodeJS.ErrnoException {
	return 'code' in (e as any);
}

function wrappedLoader(mod: any, filename: string) {
	if (filename.endsWith('.mjs')) return buildLoader(mod, filename);

	try {
		// console.error('[fix-esm] try: %s', filename);
		return originalLoader(mod, filename);
	} catch (error: any) {
		// console.log('[fix-esm] error!', error.message);
		if (!(error instanceof Error)) {
			throw new Error(`[fix-esm] unknown type of error catched: ${typeof error} - ${'' + error}.`);
		}
		if (!isNodeError(error)) {
			throw error;
		}
		if (
			error.code === 'ERR_REQUIRE_ESM' ||
			/^Cannot use (import|export) statement outside a module/.test(error.message)
		) {
			if (existsSync(filename + 'c')) {
				return wrappedLoader(mod, filename + 'c');
			}
			return buildLoader(mod, filename);
		} else if (error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
			const match = /No "exports" main defined in (.+)$/.exec(error.message);
			if (match) {
				modify_package_json(match[1]);
			} else {
				console.error('[fix-esm] ERR_PACKAGE_PATH_NOT_EXPORTED!', error.message);
			}
		}
		throw error;
	}
}

function fillCond(v: IExportCondition) {
	if (v.node) {
		v.node = {
			require: v as any, // TODO: inspect this
			default: v.node as any, // TODO: inspect this
		};
	}
	if (!v.require) {
		const rvalue = v.import ?? v.default;
		if (typeof rvalue === 'string') {
			v.require = rvalue + 'c';
		} else {
			throw new Error('[fix-esm] can not find any exports field in ' + Object.keys(v).join(', '));
		}
	}
	return v;
}

function modify_package_json(file: string) {
	const original = readFileSync(file, 'utf-8');
	const pkgJson = JSON.parse(original);
	if (pkgJson['esm-fixed']) {
		return;
	}
	pkgJson['esm-fixed'] = true;

	console.error('[fix-esm] realtime modify: %s', file);

	if (pkgJson.exports) {
		const exports = parseExportsField(pkgJson.exports);
		pkgJson.exports = exports;
		for (const [key, data] of Object.entries(exports)) {
			pkgJson.exports[key] = fillCond(data);
		}
	} else if (pkgJson.module && !pkgJson.main) {
		pkgJson.main = pkgJson.module + 'c';
	} else {
		throw new Error('[fix-esm] not know how to modify this json');
	}

	const indent = /^\s+/m.exec(original)?.[0] || '  ';
	const indentValue = indent[0] == '\t' ? '\t' : indent.length;

	const newContent = JSON.stringify(pkgJson, null, indentValue);
	writeFileSync(file, newContent);
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

	const _resolve = Module._resolveFilename;
	Module._resolveFilename = function (request: string, parent: string, isMain: boolean) {
		// console.error('[fix-esm] resolve: %s', request);
		try {
			return _resolve(request, parent, isMain);
		} catch (e: any) {
			if (e?.code === 'MODULE_NOT_FOUND') {
				const matches = /Cannot find module '(.+)c'/.exec(e.message);
				if (matches?.[1]) {
					return matches?.[1];
				}
			}
			throw e;
		}
	};
	Module._extensions['.js'] = wrappedLoader;
	Module._extensions['.mjs'] = wrappedLoader;
	Module[sym] = originalLoader;
}
