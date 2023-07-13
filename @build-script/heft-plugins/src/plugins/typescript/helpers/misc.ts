import type TypeScriptApi from 'typescript';

export function getExtension(ts: typeof TypeScriptApi, options: TypeScriptApi.CompilerOptions) {
	if (options.module === ts.ModuleKind.CommonJS) {
		return '.cjs';
	} else if (options.module! >= ts.ModuleKind.ES2015) {
		return '.mjs';
	} else {
		return '.js';
	}
}
