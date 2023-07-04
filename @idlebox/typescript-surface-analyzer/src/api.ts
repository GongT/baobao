import type TypeScriptApi from 'typescript';
import { FileCollector } from './inc/FileCollector';
import { IgnoreFiles } from './inc/IgnoreFiles';
import { consoleLogger, ILogger } from './inc/logger';
import { ITypescriptFile } from './inc/TokenCollector';
import { ApiHost } from './inc/tsapi.helpers';

export { loadFilter } from './inc/loadFilter';
export type { ILogger } from './inc/logger';
export type { IExtendParsedCommandLine } from '@idlebox/tsconfig-loader';
export { ExportKind } from './inc/TokenCollector';

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
		return this.ts.createProgram(this.additionalIgnores.filter(this.projectFiles), this.command.options, this.host);
	}

	public execute(): ITypescriptFile[] {
		const program = this.createNewProgram();
		const ret = new FileCollector(this.api, this.command.options, this.logger);
		// const tc = program.getTypeChecker();
		// this.logger.debug('project files: %s', this.projectFiles);
		// this.logger.debug('matched files: %s', program.getRootFileNames());

		const sources = [];
		for (const file of program.getSourceFiles()) {
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
