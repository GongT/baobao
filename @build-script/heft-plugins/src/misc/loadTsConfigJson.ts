import { normalize, resolve } from 'path';
import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { HeftConfiguration, IScopedLogger } from '@rushstack/heft';
import { parseConfigFileTextToJson } from 'typescript';

import type TypeScriptApi from 'typescript';
export interface ILoadConfigOverride {
	project?: string;

	include?: string[];
	files?: string[];
	exclude?: string[];

	compilerOptions?: TypeScriptApi.CompilerOptions;
}

export function parseTsConfigJson(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	rig: HeftConfiguration['rigConfig'],
	options: ILoadConfigOverride
) {
	let project = options.project;
	if (!project) {
		if (rig.rigFound) {
			const tsJsonPath = rig.tryResolveConfigFilePath('config/typescript.json');
			if (tsJsonPath) project = loadInheritedJson(tsJsonPath).project;
		}
	}
	if (!project) project = rig.tryResolveConfigFilePath('tsconfig.json');
	if (!project) project = rig.tryResolveConfigFilePath('src/tsconfig.json');
	if (!project) throw new Error('Failed find a "tsconfig.json" in this project (or rig).');

	project = resolve(rig.projectFolderPath, project);
	logger.terminal.writeVerboseLine(`using project: ${project}`);
	const virtual = resolve(project, '../__virtual_tsconfig.json');

	const { exclude, files, include, compilerOptions } = options;
	const virtualJson = {
		compilerOptions: compilerOptions ?? {},
		exclude: exclude?.length ? exclude : undefined,
		files: files?.length ? files : undefined,
		include: include?.length ? include : undefined,
	};

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
		fileExists(file: string) {
			if (file === virtual) return true;
			return ts.sys.fileExists(file);
		},
		readFile(file: string, encoding?: string) {
			if (file === virtual) return JSON.stringify(virtualJson);
			return ts.sys.readFile(file, encoding);
		},
		getCurrentDirectory: ts.sys.getCurrentDirectory,
	};

	const command = ts.getParsedCommandLineOfConfigFile(virtual, {}, host);

	if (!command) {
		throw new Error('fatal error, can not continue');
	}

	return command;
}

export function loadTsConfigJson(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	rig: HeftConfiguration['rigConfig'],
	options: ILoadConfigOverride
) {
	let project = options.project;
	const readFiles: string[] = [];

	const { exclude, files, include, compilerOptions } = options;
	if (!project) {
		if (rig.rigFound) {
			const tsJsonPath = rig.tryResolveConfigFilePath('config/typescript.json');
			if (tsJsonPath) project = loadInheritedJson(tsJsonPath).project;
		}
	}
	if (!project) project = rig.tryResolveConfigFilePath('tsconfig.json');
	if (!project) project = rig.tryResolveConfigFilePath('src/tsconfig.json');
	if (!project) throw new Error('Failed find a "tsconfig.json" in this project (or rig).');

	project = resolve(rig.projectFolderPath, project);
	logger.terminal.writeVerboseLine(`using project: ${project}`);
	const virtual = resolve(project, '../__virtual_tsconfig.json');
	const virtualJson = {
		extends: project,
		compilerOptions: compilerOptions ?? {},
		exclude: exclude?.length ? exclude : undefined,
		files: files?.length ? files : undefined,
		include: include?.length ? include : undefined,
	};
	// console.log('input options: ', JSON.stringify(virtualJson));

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
		fileExists(file: string) {
			if (file === virtual) return true;
			return ts.sys.fileExists(file);
		},
		readFile(file: string, encoding?: string) {
			if (file === virtual) return JSON.stringify(virtualJson);
			readFiles.push(file);
			const text = ts.sys.readFile(file, encoding)!;
			const json = parseConfigFileTextToJson(file, text);
			if (json.error) {
				return text;
			}
			if (Array.isArray(json.config?.exclude)) {
				json.config.exclude = json.config.exclude.filter((l: string) => {
					return !l.endsWith('.generated.ts');
				});
			}
			return JSON.stringify(json.config);
		},
		getCurrentDirectory: ts.sys.getCurrentDirectory,
	};

	const command = ts.getParsedCommandLineOfConfigFile(virtual, {}, host);

	if (!command) {
		throw new Error('fatal error, can not continue');
	}

	return { command, files: readFiles };
}
