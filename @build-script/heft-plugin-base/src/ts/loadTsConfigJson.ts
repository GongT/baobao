import { HeftConfiguration, IScopedLogger } from '@rushstack/heft';
import { ConfigurationFile } from '@rushstack/heft-config-file';
import { existsSync } from 'fs';
import { normalize, resolve } from 'path';

import type TypeScriptApi from 'typescript';

export interface ILoadConfigOverride {
	project?: string;

	include?: string[];
	files?: string[];
	exclude?: string[];

	compilerOptions?: TypeScriptApi.CompilerOptions;
}

function tryFindTsconfig(logger: IScopedLogger, project: string | undefined, rig: HeftConfiguration['rigConfig']) {
	if (project) return project;

	if (rig.rigFound) {
		const tsJsonPath = rig.tryResolveConfigFilePath('config/typescript.json');
		if (tsJsonPath) {
			const config = new ConfigurationFile<any>({
				projectRelativeFilePath: 'config/typescript.json',
				jsonSchemaObject: {},
			});
			const data = config.loadConfigurationFileForProject(logger.terminal, rig.projectFolderPath, rig);
			if (data.project) return data.project;
		}
	}

	const rootFile = resolve(rig.projectFolderPath, 'tsconfig.json');
	if (existsSync(rootFile)) {
		return 'tsconfig.json';
	}

	const srcFile = resolve(rig.projectFolderPath, 'src/tsconfig.json');
	if (existsSync(srcFile)) {
		return 'src/tsconfig.json';
	}

	project = rig.tryResolveConfigFilePath('tsconfig.json');
	if (project) return project;

	project = rig.tryResolveConfigFilePath('src/tsconfig.json');
	if (project) return project;

	throw new Error('Failed find a "tsconfig.json" in this project (or rig).');
}

function tryGetTsconfigAbsolute(
	logger: IScopedLogger,
	project: string | undefined,
	rig: HeftConfiguration['rigConfig'],
) {
	return resolve(rig.projectFolderPath, tryFindTsconfig(logger, project, rig));
}

function createCommand(
	ts: typeof TypeScriptApi,
	project: string,
	virtualConfig: any,
	readFile: (file: string, encoding?: string) => string | undefined,
) {
	const virtual = resolve(project, '../__virtual_tsconfig.json');

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
			if (file === virtual) return JSON.stringify(virtualConfig);

			return readFile(file, encoding);
		},
		getCurrentDirectory: ts.sys.getCurrentDirectory,
	};
	const command = ts.getParsedCommandLineOfConfigFile(virtual, {}, host);

	if (!command) {
		throw new Error('fatal error, can not continue');
	}

	if (!command.options.rootDir) {
		command.options.rootDir = resolve(project, '..');
	}
	return command;
}

export function parseSingleTsConfigJson(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	rig: HeftConfiguration['rigConfig'],
	options: ILoadConfigOverride,
) {
	const project = tryGetTsconfigAbsolute(logger, options.project, rig);

	logger.terminal.writeVerboseLine(`using project: ${project}`);

	const { exclude, files, include, compilerOptions } = options;
	const virtualJson = {
		compilerOptions: compilerOptions ?? {},
		exclude: exclude?.length ? exclude : undefined,
		files: files?.length ? files : undefined,
		include: include?.length ? include : undefined,
	};

	function readFile(file: string, encoding?: string) {
		return ts.sys.readFile(file, encoding);
	}

	return createCommand(ts, project, virtualJson, readFile);
}

export interface ILoadedConfigFile {
	readonly command: TypeScriptApi.ParsedCommandLine;
	readonly configFiles: readonly string[];
}

export function loadTsConfigJson(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	rig: HeftConfiguration['rigConfig'],
	options: ILoadConfigOverride,
): ILoadedConfigFile {
	const { exclude, files, include, compilerOptions } = options;
	const project = tryGetTsconfigAbsolute(logger, options.project, rig);

	logger.terminal.writeVerboseLine(`using project: ${project}`);
	const virtualJson = {
		extends: project,
		compilerOptions: compilerOptions ?? {},
		exclude: exclude?.length ? exclude : undefined,
		files: files?.length ? files : undefined,
		include: include?.length ? include : undefined,
	};
	// console.log('input options: ', JSON.stringify(virtualJson));

	const readFiles: string[] = [];
	function readFile(file: string, encoding?: string) {
		readFiles.push(file);
		const text = ts.sys.readFile(file, encoding)!;
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

	const command = createCommand(ts, project, virtualJson, readFile);

	return { command, configFiles: readFiles };
}

export function dumpTsConfig(ts: typeof TypeScriptApi, options: TypeScriptApi.CompilerOptions): any {
	const map = [
		['target', ts.ScriptTarget],
		['module', ts.ModuleKind],
		['moduleResolution', ts.ModuleResolutionKind],
		['moduleDetection', ts.ModuleDetectionKind],
		['newLine', ts.NewLineKind],
		['jsx', ts.JsxEmit],
	] as const;

	const ret: any = { ...options };
	for (const [key, enumCls] of map) {
		ret[key] = enumCls[ret[key]];
	}

	return ret;
}
