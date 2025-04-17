import type TypeScriptApi from 'typescript';
import { findTslib } from './tslib.js';
import { IHeftJsonOptions } from './type.js';

export function normalizeOptions(
	ts: typeof TypeScriptApi,
	options: IHeftJsonOptions,
	command: TypeScriptApi.ParsedCommandLine,
): IHeftJsonOptions {
	const ret: IHeftJsonOptions = {
		extension: options.extension ?? getExtension(ts, command.options),
		fast: options.fast ?? false,
		warningAsError: options.warningAsError ?? true,
		skipNodeModules: options.skipNodeModules ?? false,
		errorLevels: {
			error: ensureNumbers(options.errorLevels?.error ?? []),
			notice: ensureNumbers(options.errorLevels?.notice ?? []),
			warning: ensureNumbers(options.errorLevels?.warning ?? []),
		},
		compilerOptions: options.compilerOptions,
	};

	if (
		ret.skipNodeModules ||
		ret.errorLevels.error.length ||
		ret.errorLevels.notice.length ||
		ret.errorLevels.warning.length
	) {
		command.options.noEmitOnError = false;
	}

	command.options.inlineSourceMap = false;
	if (!command.options.paths) command.options.paths = {};
	if (!command.options.paths.tslib) command.options.paths.tslib = findTslib();

	if (command.options.module !== ts.ModuleKind.CommonJS && command.options.module! < ts.ModuleKind.ES2015) {
		throw new Error(
			`unsupported module type: ${
				ts.ModuleKind[command.options.module!]
			} (current only support commonjs and esnext)`,
		);
	}

	return ret;
}

function getExtension(ts: typeof TypeScriptApi, options: TypeScriptApi.CompilerOptions) {
	if (options.module === ts.ModuleKind.CommonJS) {
		return '.cjs';
	} else if (options.module! >= ts.ModuleKind.ES2015) {
		return '.mjs';
	} else {
		return '.js';
	}
}

function ensureNumbers(array: any[]) {
	return array.map((v) => {
		v = parseInt(v);
		if (isNaN(v)) {
			throw new TypeError('[@build-script/heft-typescript-plugin] invalid options: errorLevels must all number');
		}
		return v;
	});
}
