import type TypeScriptApi from 'typescript';
import { IMyOptions, IMyOptionsInput } from './type';

export function normalizeOptions(
	ts: typeof TypeScriptApi,
	options: IMyOptionsInput,
	command: TypeScriptApi.ParsedCommandLine,
): IMyOptions {
	const ret: IMyOptions = {
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
			throw new TypeError('[@build-script/heft-plugins] invalid options: errorLevels must all number');
		}
		return v;
	});
}
