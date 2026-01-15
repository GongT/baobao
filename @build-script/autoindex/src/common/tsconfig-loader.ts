import type { IMyLogger } from '@idlebox/logger';
import { isModuleResolutionError } from '@idlebox/common';
import { parse, stringify } from 'comment-json';
import { createRequire } from 'node:module';
import { normalize, resolve } from 'node:path';
import type TypeScriptApi from 'typescript';

export interface ILoadedConfigFile {
	readonly command: TypeScriptApi.ParsedCommandLine;
	readonly configFiles: readonly string[];
}

interface ILoadTsConfigJsonOptions {
	exclude?: string[];
	include?: string[];
}

export function loadTsConfigJson(ts: typeof TypeScriptApi, tsconfigJson: string, options: ILoadTsConfigJsonOptions = {}): ILoadedConfigFile {
	const { exclude, include } = options;

	const readFiles: string[] = [];
	function readFile(file: string, encoding?: string) {
		readFiles.push(file);
		const text = ts.sys.readFile(file, encoding);
		if (!text) throw new Error(`failed read file: ${file}`);
		const json = ts.parseConfigFileTextToJson(file, text);
		if (json.error) {
			return text;
		}
		if (Array.isArray(json.config?.exclude)) {
			json.config.exclude = json.config.exclude.filter((l: string) => {
				return !l.endsWith('.generated.ts');
			});
		}
		return JSON.stringify(json.config);
	}

	const myFormatDiagnosticsHost: TypeScriptApi.FormatDiagnosticsHost = {
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		getCanonicalFileName: normalize,
		getNewLine(): string {
			return ts.sys.newLine;
		},
	};

	const host: TypeScriptApi.ParseConfigFileHost = {
		onUnRecoverableConfigFileDiagnostic(diagnostic: TypeScriptApi.Diagnostic) {
			throw new Error(ts.formatDiagnostic(diagnostic, myFormatDiagnosticsHost).trim());
		},
		useCaseSensitiveFileNames: true,
		readDirectory: ts.sys.readDirectory,
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
	};

	let config_patched = true;
	if (exclude?.length || include?.length) {
		config_patched = false;
		Object.assign(host, {
			readFile(file: string, encoding?: string) {
				let text = readFile(file, encoding);
				if (file === tsconfigJson) {
					const content: any = parse(text);
					if (exclude?.length) {
						if (!content.exclude) content.exclude = [];
						content.exclude.push(...exclude);
					}
					if (include?.length) {
						if (!content.include) content.include = [];
						content.include.push(...include);
					}
					text = stringify(content, null, 2);
					config_patched = true;
				}
				return text;
			},
		});
	}

	const command = ts.getParsedCommandLineOfConfigFile(tsconfigJson, {}, host);

	if (!command) {
		throw new Error('fatal error, can not continue');
	}

	if (!config_patched) {
		throw new Error(`tsconfig.json file "${tsconfigJson}" has not been patched with exclude/include options, please report issue.`);
	}

	if (!command.options.rootDir) {
		command.options.rootDir = resolve(tsconfigJson, '..');
	}

	return { command, configFiles: readFiles };
}

function interop(v: any) {
	return v.default ?? v;
}

export async function getTypescript(tsconfigFile: string, logger?: IMyLogger): Promise<typeof TypeScriptApi> {
	const require = createRequire(tsconfigFile);
	try {
		return require('typescript');
	} catch (e) {
		if (isModuleResolutionError(e)) {
			logger?.error('typescript not found in target project, using bundled one.');
			return interop(await import('typescript'));
		}
		throw e;
	}
}
