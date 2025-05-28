import type TypeScriptApi from 'typescript';
import { FileCollector } from './inc/FileCollector.js';
import { IgnoreFiles } from './inc/IgnoreFiles.js';
import { consoleLogger, type ILogger } from './inc/logger.js';
import type { ITypescriptFile } from './inc/TokenCollector.js';
import { ApiHost } from './inc/tsapi.helpers.js';

export { loadTsConfigJsonFile, type IExtendParsedCommandLine } from '@idlebox/tsconfig-loader';
export { loadFilter } from './inc/loadFilter.js';
export type { ILogger } from './inc/logger.js';
export { ExportKind } from './inc/TokenCollector.js';
export type { IIdentifierResult, ITypescriptFile } from './inc/TokenCollector.js';
export { IgnoreFiles };

export class TypescriptProject {
	public readonly projectFiles: readonly string[];
	private readonly host: TypeScriptApi.CompilerHost;
	public readonly additionalIgnores: IgnoreFiles;
	private readonly api: ApiHost;

	constructor(
		readonly ts: typeof TypeScriptApi,
		private readonly command: TypeScriptApi.ParsedCommandLine,
		private readonly logger: ILogger = consoleLogger
	) {
		this.api = new ApiHost(ts);
		this.projectFiles = this.command.fileNames;
		this.host = ts.createCompilerHost(this.command.options, true);

		this.additionalIgnores = new IgnoreFiles(logger);
	}

	get compilerOptions(): Readonly<TypeScriptApi.CompilerOptions> {
		return this.command.options;
	}

	get projectRoot() {
		return this.command.options.rootDir;
	}

	public createNewProgram(): TypeScriptApi.Program {
		// 这里过滤作用不大，因为被import的文件还是会被包含在内
		return this.ts.createProgram(this.additionalIgnores.filter(this.projectFiles), this.command.options, this.host);
	}

	public execute(stripTags?: readonly string[]): ITypescriptFile[] {
		const program = this.createNewProgram();
		const ret = new FileCollector(this.api, this.command.options, this.logger);

		if (stripTags) {
			ret.stripTags = stripTags;
		}

		// const tc = program.getTypeChecker();
		// this.logger.debug('project files: %s', this.projectFiles);
		// this.logger.debug('matched files: %s', program.getRootFileNames());

		const sources = [];
		for (const file of program.getSourceFiles()) {
			if (this.additionalIgnores.isIgnored(file.fileName)) {
				continue;
			}

			const isDefaultLibrary = program.isSourceFileDefaultLibrary(file);
			const isFromExternalLibrary = program.isSourceFileFromExternalLibrary(file);

			// this.logger.debug(
			// 	'%s: declare:%s, stdlib:%s, external:%s, declare:%s',
			// 	file.fileName,
			// 	file.isDeclarationFile,
			// 	isDefaultLibrary,
			// 	isFromExternalLibrary,
			// 	file.isDeclarationFile
			// );

			if (file.isDeclarationFile || isDefaultLibrary || isFromExternalLibrary) {
				continue;
			}

			sources.push(file);
		}

		return ret.collect(sources);
	}
}
