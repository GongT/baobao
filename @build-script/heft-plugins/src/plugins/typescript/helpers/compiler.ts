import type { HeftConfiguration, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { realpathSync } from 'fs';
import type TypeScriptApi from 'typescript';
import { loadTsConfigJson } from '../../../misc/loadTsConfigJson';
import { CustomDiagnosticPrinter } from './diagnostic';
import { findTslib } from './tslib';
import { IProgramState } from './type';
import { normalizeOptions } from './type.options';
import { createFileWriter } from './writeFile';

interface ICache {
	moduleResolve: TypeScriptApi.ModuleResolutionCache;
	sourceFile: Map<string, TypeScriptApi.SourceFile>;
	realpath: Map<string, string>;
}

const cache: Partial<ICache> = {};

function cached_realpath(path: string) {
	let real = cache.realpath!.get(path);
	if (real) return real;

	try {
		real = realpathSync(path);
	} catch {
		real = '';
	}

	// console.log('realpath(%s) -> %s', path, real);
	cache.realpath!.set(path, real);

	return real;
}

function createCompilerHost(
	logger: IScopedLogger,
	ts: typeof TypeScriptApi,
	compilerOptions: TypeScriptApi.CompilerOptions,
) {
	logger.terminal.writeVerboseLine(`compilerOptions.incremental = ${compilerOptions.incremental}`);
	const host = (compilerOptions.incremental ? ts.createCompilerHost : ts.createIncrementalCompilerHost)(
		compilerOptions,
	);

	// if (!cache.moduleResolve) {
	// 	logger.terminal.writeVerboseLine(`create moduleResolve cache.`);
	// 	cache.moduleResolve = ts.createModuleResolutionCache(
	// 		host.getCurrentDirectory(),
	// 		host.getCanonicalFileName,
	// 		compilerOptions,
	// 	);
	// }
	// host.getModuleResolutionCache = () => cache.moduleResolve;

	// host.resolveModuleNameLiterals = resolveModuleNames(ts, compilerOptions, cache.moduleResolve);
	// host.resolveTypeReferenceDirectiveReferences
	host.resolveTypeReferenceDirectiveReferences;
	host.getEnvironmentVariable = (name: string) => process.env[name];

	cache.realpath = new Map();
	host.realpath = cached_realpath;

	return host;
}

// function resolveModuleNames(
// 	ts: typeof TypeScriptApi,
// 	options: TypeScriptApi.CompilerOptions,
// 	cache: TypeScriptApi.ModuleResolutionCache,
// ) {
// 	return (moduleNames: readonly TypeScriptApi.StringLiteralLike[], containingFile: string) => {
// 		const r = moduleNames.map((moduleName) => {
// 			const result = ts.resolveModuleName(
// 				moduleName.text,
// 				containingFile,
// 				options,
// 				{
// 					fileExists: ts.sys.fileExists,
// 					readFile: ts.sys.readFile,
// 				},
// 				cache,
// 			);
// 			return result;
// 		});

// 		console.log('?????? resolve: %s', containingFile);
// 		r.forEach((r, i) => {
// 			console.log('       * %s => %s', moduleNames[i].text, r.resolvedModule?.resolvedFileName);
// 		});
// 		return r;
// 	};
// }

export function executeCompile(
	{ ts, createTransformers, options: inOptions }: IProgramState,
	session: IHeftTaskSession,
	configuration: HeftConfiguration,
	files?: string[],
) {
	session.logger.terminal.writeVerboseLine('tsconfig file loaded');

	const { command } = loadTsConfigJson(session.logger, ts, configuration.rigConfig, inOptions);
	command.options.inlineSourceMap = false;
	if (!command.options.paths) command.options.paths = {};
	if (!command.options.paths.tslib) command.options.paths.tslib = findTslib();
	const options = normalizeOptions(ts, inOptions, command);

	if (command.options.module !== ts.ModuleKind.CommonJS && command.options.module! < ts.ModuleKind.ES2015) {
		throw new Error(
			`unsupported module type: ${
				ts.ModuleKind[command.options.module!]
			} (current only support commonjs and esnext)`,
		);
	}
	// console.log(`command.options: !!! `, dumpTsConfig(ts, command.options));

	const diagHost = new CustomDiagnosticPrinter(ts, configuration.buildFolderPath, options, session.logger);

	const compilerHost = createCompilerHost(session.logger, ts, command.options);
	// const isolatedModules = !!options.fast && !!command.options.isolatedModules;

	const fileNames = options.fast ? command.fileNames : filterOutTests(command.fileNames);

	const program = ts.createProgram({
		rootNames: fileNames,
		configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(command),
		options: command.options,
		projectReferences: command.projectReferences,
		host: compilerHost,
		// oldProgram: build.program,
	});

	const privateApi = (program as any).getModuleResolutionCache;
	if (!privateApi) {
		throw new Error('fix me: TypeScript private object change.');
	}
	compilerHost.getModuleResolutionCache = privateApi.bind(program);

	diagHost.add(ts.getPreEmitDiagnostics(program));

	if (diagHost.print().shouldFail) {
		session.logger.terminal.writeVerboseLine('program create failed.');
		return;
	}
	session.logger.terminal.writeVerboseLine('program created');

	const writeCtx = createFileWriter(ts, session, options);
	const customTransformers = createTransformers(program, compilerHost);

	let someskip = false,
		emittedFileCnt = 0;
	if (files) {
		session.logger.terminal.writeVerboseLine(
			`partial compile: ${files.length} of ${program.getRootFileNames().length} files`,
		);
		for (const item of files) {
			const file = program.getSourceFile(item);
			if (file) {
				const result = program.emit(file, writeCtx.writeFile, undefined, undefined, customTransformers);
				diagHost.add(result.diagnostics);
				// console.log(result);
				if (result.emitSkipped) someskip = true;
				emittedFileCnt += result.emittedFiles?.length ?? 0;
			} else {
				session.logger.emitWarning(new Error('file not include in program: ' + item));
			}
		}
	} else {
		session.logger.terminal.writeVerboseLine(`full project compile: ${program.getRootFileNames().length} files`);
		const result = program.emit(undefined, writeCtx.writeFile, undefined, undefined, customTransformers);
		if (result.emitSkipped) someskip = true;
		emittedFileCnt += result.emittedFiles?.length ?? 0;

		diagHost.add(result.diagnostics);
	}

	diagHost.print();
	if (diagHost.shouldFail) {
		session.logger.terminal.writeVerboseLine(`compile error (emitSkipped=${someskip})`);
		return;
	}

	if (someskip) {
		session.logger.emitError(new Error(`emit skip, ${emittedFileCnt} files emitted`));
		return;
	}

	session.logger.terminal.writeVerboseLine('emit complete');

	if (options.fast) session.logger.terminal.write('[FAST] ');
	session.logger.terminal.writeLine(
		`typescript compiled, ${writeCtx.files} file${writeCtx.files > 1 ? 's' : ''} emitted, no errors.`,
	);
	session.logger.terminal.writeDebugLine(`Module: ${ts.ModuleKind[command.options.module!]}`);
	session.logger.terminal.writeDebugLine(`OutDir: ${command.options.outDir}`);
}
function filterOutTests(fileNames: string[]) {
	const isTestFile = /\.test\.(mjs|cjs|js|tsx?)$/i;
	return fileNames.filter((e) => {
		return !isTestFile.test(e);
	});
}
