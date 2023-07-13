import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';

import { loadTsConfigJson } from '../../../misc/loadTsConfigJson';
import { getExtension } from './misc';
import { printCompileDiagnostic } from './printDiagnostic';
import { IProgramState } from './type';
import { createFileWriter } from './writeFile';

interface ICache {
	moduleResolve: TypeScriptApi.ModuleResolutionCache;
	sourceFile: Map<string, TypeScriptApi.SourceFile>;
}

const cache: Partial<ICache> = {};

// interface ICachedCompilerHost extends TypeScriptApi.CompilerHost {
// 	getSourceFile: TypeScriptApi.CompilerHost['getSourceFile'] & { cache?: Map<string, TypeScriptApi.SourceFile> };
// }

// function _changeCompilerHostToUseCache(compilerHost: ICachedCompilerHost) {
// 	if (!cache.sourceFile) cache.sourceFile = new Map();

// 	const { getSourceFile: innerGetSourceFile } = compilerHost;
// 	if (innerGetSourceFile.cache === cache.sourceFile) {
// 		return;
// 	}
// 	// Enable source file persistence
// 	const getSourceFile = (
// 		fileName: string,
// 		languageVersionOrOptions: TypeScriptApi.ScriptTarget,
// 		onError?: (message: string) => void,
// 		shouldCreateNewSourceFile?: boolean
// 	) => {
// 		if (!shouldCreateNewSourceFile) {
// 			const cachedSourceFile = cache.sourceFile!.get(fileName);
// 			if (cachedSourceFile) {
// 				return cachedSourceFile;
// 			}
// 		}
// 		const result = innerGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
// 		if (result) {
// 			cache.sourceFile!.set(fileName, result);
// 		} else {
// 			cache.sourceFile!.delete(fileName);
// 		}
// 		return result;
// 	};
// 	getSourceFile.cache = cache.sourceFile;
// 	compilerHost.getSourceFile = getSourceFile;
// }

export function createCompilerHost(
	ts: typeof TypeScriptApi,
	compilerOptions: TypeScriptApi.CompilerOptions
	// cancellationToken: CancellationToken
) {
	const host = (compilerOptions.incremental ? ts.createCompilerHost : ts.createIncrementalCompilerHost)(
		compilerOptions
	);

	// host.getCancellationToken = (): TypeScriptApi.CancellationToken => {
	// 	return {
	// 		isCancellationRequested() {
	// 			return cancellationToken.isCancelled;
	// 		},
	// 		throwIfCancellationRequested() {
	// 			console.error('what is this?');
	// 		},
	// 	};
	// };

	if (!cache.moduleResolve) {
		cache.moduleResolve = ts.createModuleResolutionCache(
			host.getCurrentDirectory(),
			host.getCanonicalFileName,
			compilerOptions
		);
	}

	host.directoryExists = ts.sys.directoryExists;
	host.realpath = ts.sys.realpath;
	host.getDirectories = ts.sys.getDirectories;
	host.readDirectory = ts.sys.readDirectory;
	host.getModuleResolutionCache = () => cache.moduleResolve;
	host.resolveModuleNameLiterals = resolveModuleNames(ts, compilerOptions, cache.moduleResolve);
	host.resolveTypeReferenceDirectiveReferences;
	host.getEnvironmentVariable = (name: string) => process.env[name];
	// host.hasInvalidatedResolutions
	// host.getParsedCommandLine;

	// _changeCompilerHostToUseCache(host);

	return host;
}

function resolveModuleNames(
	ts: typeof TypeScriptApi,
	options: TypeScriptApi.CompilerOptions,
	cache: TypeScriptApi.ModuleResolutionCache
) {
	return (moduleNames: readonly TypeScriptApi.StringLiteralLike[], containingFile: string) => {
		return moduleNames.map((moduleName) => {
			const result = ts.resolveModuleName(
				moduleName.text,
				containingFile,
				options,
				{
					fileExists: ts.sys.fileExists,
					readFile: ts.sys.readFile,
				},
				cache
			);
			return result;
		});
	};
}

export function executeCompile(
	{ ts, createTransformers, options }: IProgramState,
	session: IHeftTaskSession,
	configuration: HeftConfiguration,
	files?: string[]
) {
	session.logger.terminal.writeVerboseLine('tsconfig file loaded');

	const { command } = loadTsConfigJson(session.logger, ts, configuration.rigConfig, options);

	if (command.options.module !== ts.ModuleKind.CommonJS && command.options.module! < ts.ModuleKind.ES2015) {
		throw new Error(
			`unsupported module type: ${
				ts.ModuleKind[command.options.module!]
			} (current only support commonjs and esnext)`
		);
	}

	command.options.inlineSourceMap = false;
	// console.log(`command.options: !!! `, command.options);

	const compilerHost = createCompilerHost(ts, command.options);
	// const isolatedModules = !!options.fast && !!command.options.isolatedModules;

	const program = ts.createProgram({
		rootNames: command.fileNames,
		configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(command),
		options: command.options,
		projectReferences: command.projectReferences,
		host: compilerHost,
		// oldProgram: build.program,
	});

	const diagnostics = [];
	diagnostics.push(...program.getConfigFileParsingDiagnostics());
	diagnostics.push(...program.getOptionsDiagnostics());
	if (!!options.fast) {
		diagnostics.push(...program.getSyntacticDiagnostics());
		diagnostics.push(...program.getGlobalDiagnostics());
		diagnostics.push(...program.getSemanticDiagnostics());
		if (!!(command.options.declaration || command.options.composite)) {
			diagnostics.push(...program.getDeclarationDiagnostics());
		}
	}
	const sortedDiagnostics = ts.sortAndDeduplicateDiagnostics(diagnostics || []);
	// console.log('sortedDiagnostics', sortedDiagnostics.length);

	printCompileDiagnostic(ts, !!options.fast, configuration.buildFolderPath, session.logger, sortedDiagnostics);
	session.logger.terminal.writeVerboseLine('program created');

	if (!options.extension) options.extension = getExtension(ts, command.options);

	const writeCtx = createFileWriter(ts, session, options);
	const customTransformers = createTransformers(program, compilerHost);

	if (files) {
		const diagnostics = [];
		for (const item of files) {
			const file = program.getSourceFile(item);
			if (file) {
				// console.log('compile file: ', item);
				const result = program.emit(file, writeCtx.writeFile, undefined, undefined, customTransformers);
				diagnostics.push(...result.diagnostics);
				// console.log(result);
			} else {
				session.logger.emitWarning(new Error('file not include in program: ' + item));
			}
		}
		printCompileDiagnostic(ts, !!options.fast, configuration.buildFolderPath, session.logger, diagnostics);
	} else {
		const result = program.emit(undefined, writeCtx.writeFile, undefined, undefined, customTransformers);
		printCompileDiagnostic(ts, !!options.fast, configuration.buildFolderPath, session.logger, result.diagnostics);
	}

	session.logger.terminal.writeVerboseLine('emit complete');

	if (options.fast) session.logger.terminal.write('[FAST] ');
	session.logger.terminal.writeLine(
		`typescript compiled, ${writeCtx.files} file${writeCtx.files > 1 ? 's' : ''} emitted. ${
			ts.ModuleKind[command.options.module!]
		}: ${command.options.outDir}`
	);
}
