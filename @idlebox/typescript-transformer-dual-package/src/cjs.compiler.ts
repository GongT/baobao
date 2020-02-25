import {
	CompilerHost,
	CompilerOptions,
	createCompilerHost,
	createProgram,
	formatDiagnostics,
	ModuleKind,
	Program,
	ScriptTarget,
	SourceFile,
	TransformerFactory,
} from 'typescript';
import { createExtensionTransformer } from './lib';
import { dirname, basename } from 'path';
const hasWrap = Symbol('@gongt/hasWrap');

export interface ITestInterface {
	value: number;
}

export class CjsCompiler {
	private declare transformer: TransformerFactory<SourceFile>;
	private declare program: Program;
	private declare host: CompilerHost;

	private declare debug: (message?: any, ...optionalParams: any[]) => void;

	constructor(verbose: boolean) {
		this.debug = verbose ? console.error.bind(console) : () => {};
	}

	updateConfig(esmProgram: Program, overrideOptions: CompilerOptions) {
		let compilerOptions: CompilerOptions = {
			...esmProgram.getCompilerOptions(),
		};
		delete compilerOptions.project;
		delete compilerOptions.tsBuildInfoFile;
		compilerOptions = {
			...compilerOptions,
			target: ScriptTarget.ES2018,
			...overrideOptions,
			noEmitOnError: false,
			incremental: false,
			declarationMap: false,
			declaration: false,
			composite: false,
			module: ModuleKind.CommonJS,
		};
		delete compilerOptions.plugins;

		this.host = createCompilerHost(compilerOptions, true);
		this.wrapHost(this.host);

		const knownSources: string[] = [];
		for (const file of esmProgram.getSourceFiles()) {
			if (file.isDeclarationFile) continue;
			const cjsFileName = file.fileName.replace(/\.tsx?/i, (m0: string) => `.cjs${m0}`);
			knownSources.push(cjsFileName);
		}
		this.debug('knownSources=%j', knownSources);

		this.debug(' + before createProgram');
		this.program = createProgram(knownSources, compilerOptions, this.host);
		this.debug(' + after createProgram');
		this.transformer = createExtensionTransformer('.cjs', this.program);

		return true;
	}

	public walkSourceFile(source: string) {
		const sourceFile = this.program.getSourceFile(source.replace(/\.ts$/i, (m0) => `.cjs${m0}`));
		this.debug(' + before emit (%s)', sourceFile?.fileName);
		if (!sourceFile) {
			console.error('Can not found source file: %s', source);
		}

		const ret = this.program.emit(sourceFile, this.createWriteFile(this.host), undefined, false, {
			before: [this.transformer],
		});
		this.debug(' + after emit');

		if (ret.diagnostics.length) {
			console.error(formatDiagnostics(ret.diagnostics, this.host));
		}
	}

	private createWriteFile(host: CompilerHost) {
		return (
			fileName: string,
			data: string,
			writeByteOrderMark: boolean,
			onError?: (message: string) => void,
			sourceFiles?: readonly SourceFile[]
		) => {
			const dir = dirname(fileName);
			const base = basename(fileName);
			const newBase = base.replace(/(\.cjs)(?:\.[jt]sx?)(.map$|$)/i, '$1$2');
			this.debug('  * cjs write: %s/{%s => %s}', dir, base, newBase);
			return host.writeFile(dir + '/' + newBase, data + '\n', writeByteOrderMark, onError, sourceFiles);
		};
	}

	private wrapHost(host: CompilerHost) {
		if ((host as any)[hasWrap]) {
			return;
		}
		(host as any)[hasWrap] = true;

		const original = host.readFile;
		function wrappedReadFile(fileName: string) {
			fileName = fileName.replace(/\.cjs(\.tsx?)$/i, (_: string, m1: string) => m1);
			return original(fileName);
		}
		host.readFile = wrappedReadFile;
	}
}
