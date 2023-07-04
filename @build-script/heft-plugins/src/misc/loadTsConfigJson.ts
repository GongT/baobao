import type TypeScriptApi from 'typescript';
import { normalize, resolve } from 'path';
import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { HeftConfiguration, IScopedLogger } from '@rushstack/heft';
import { ParsedCommandLine } from 'typescript';

export interface ILoadConfigOverride {
	project?: string;

	include?: string[];
	files?: string[];
	exclude?: string[];

	compilerOptions?: TypeScriptApi.CompilerOptions;
}

const cache = new Map<string, ParsedCommandLine>();

export async function loadTsConfigJson(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	rig: HeftConfiguration['rigConfig'],
	options: ILoadConfigOverride
) {
	let project = options.project;
	const id = `${rig.projectFolderPath}:${project ?? ''}:${JSON.stringify(options)}`;
	if (cache.has(id)) {
		return cache.get(id)!;
	}

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
		exclude,
		files,
		include,
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

	const cmdline = ts.getParsedCommandLineOfConfigFile(virtual, {}, host);

	if (!cmdline) {
		throw new Error('fatal error, can not continue');
	}

	cache.set(id, cmdline);
	return cmdline;
}
