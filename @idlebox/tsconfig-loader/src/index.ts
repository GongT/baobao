import { existsSync } from 'node:fs';
import { dirname, normalize, resolve } from 'node:path';
import type TypeScriptApi from 'typescript';

export interface IFilledOptions extends TypeScriptApi.CompilerOptions {
	configFilePath: string;
	outDir: string;
	rootDir: string;
	declarationDir: string;
}
export interface IExtendParsedCommandLine extends TypeScriptApi.ParsedCommandLine {
	options: IFilledOptions;
}

/**
 * load options from tsconfig.json using TypeScript API
 */
export function loadTsConfigJsonFile(project: string, ts: typeof TypeScriptApi): IExtendParsedCommandLine {
	let path = resolve(process.cwd(), project);

	const sub = resolve(path, 'tsconfig.json');
	if (existsSync(sub)) {
		path = sub;
	}

	const myFormatDiagnosticsHost: TypeScriptApi.FormatDiagnosticsHost = {
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		getCanonicalFileName: normalize,
		getNewLine(): string {
			return ts.sys.newLine;
		},
	};

	const myParseConfigFileHost: TypeScriptApi.ParseConfigFileHost = {
		onUnRecoverableConfigFileDiagnostic(diagnostic: TypeScriptApi.Diagnostic) {
			throw new Error(ts.formatDiagnostic(diagnostic, myFormatDiagnosticsHost).trim());
		},
		useCaseSensitiveFileNames: false,
		readDirectory: ts.sys.readDirectory,
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		getCurrentDirectory: ts.sys.getCurrentDirectory,
	};

	const command = ts.getParsedCommandLineOfConfigFile(path, {}, myParseConfigFileHost) as IExtendParsedCommandLine;

	fillOptions(command.options);

	return command;
}

/**
 * Set options.outDir & options.rootDir & options.rootDir if they did not set already
 * Note: this will change input options object
 * @public
 */
export function fillOptions(options: TypeScriptApi.CompilerOptions): IFilledOptions {
	const opts = options as unknown as IFilledOptions;
	if (!opts.configFilePath) {
		throw new Error('typescript API has been changed, please report issue to "@idlebox/tsconfig-loader" package');
	}
	if (!opts.rootDir) {
		opts.rootDir = dirname(opts.configFilePath);
	}
	if (!opts.outDir) {
		opts.outDir = dirname(opts.configFilePath);
	}
	if (!opts.declarationDir) {
		opts.declarationDir = dirname(opts.configFilePath);
	}
	return opts;
}

/**
 * Get TypeScriptApi.CompilerOptions.rootDir, always string, never undefeined
 * Can be ts.TypeScriptApi.CompilerOptions, but it must loaded from filesystem (like tsc -p)
 * @returns
 */
export function getSourceRoot(command: TypeScriptApi.ParsedCommandLine | TypeScriptApi.CompilerOptions) {
	return getRoot(command, 'rootDir');
}

/**
 * Get TypeScriptApi.CompilerOptions.outDir, always string, never undefeined
 * Can be ts.TypeScriptApi.CompilerOptions, but it must loaded from filesystem (like tsc -p)
 * @returns
 */
export function getOutputRoot(command: TypeScriptApi.ParsedCommandLine | TypeScriptApi.CompilerOptions) {
	return getRoot(command, 'outDir');
}

/**
 * Get the path of loaded tsconfig.json
 * Can be ts.TypeScriptApi.CompilerOptions, but it must loaded from filesystem (like tsc -p)
 * @returns
 */
export function getProjectConfigFile(command: TypeScriptApi.ParsedCommandLine | TypeScriptApi.CompilerOptions): string {
	const options: TypeScriptApi.CompilerOptions = command.raw ? (command as TypeScriptApi.ParsedCommandLine).options : (command as TypeScriptApi.CompilerOptions);
	return options.configFilePath as string;
}

function getRoot(command: TypeScriptApi.ParsedCommandLine | TypeScriptApi.CompilerOptions, type: 'outDir' | 'rootDir') {
	const options: TypeScriptApi.CompilerOptions = command.options ? (command as TypeScriptApi.ParsedCommandLine).options : (command as TypeScriptApi.CompilerOptions);
	let ret = options[type];
	if (!ret && options.configFilePath) {
		ret = dirname(options.configFilePath as string);
	}
	if (!ret) {
		throw new TypeError('can not get tsconfig.json path from Typescript API, maybe not compitable version');
	}
	return ret;
}
