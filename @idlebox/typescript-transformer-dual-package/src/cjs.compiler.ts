import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import {
	CompilerOptions,
	getOutputFileNames,
	ModuleKind,
	Program,
	ScriptTarget,
	SourceFile,
	TransformationContext,
	TransformerFactory,
	transpileModule,
} from 'typescript';
import { createExtensionTransformer } from './lib';

export class CjsCompiler {
	private readonly compilerOptions: CompilerOptions;
	private readonly transformer: TransformerFactory<SourceFile>;

	constructor(program: Program, overrideOptions: CompilerOptions) {
		this.transformer = createExtensionTransformer('.cjs', program);
		this.compilerOptions = {
			...program.getCompilerOptions(),
		};
		delete this.compilerOptions.project;
		delete this.compilerOptions.tsBuildInfoFile;
		this.compilerOptions = {
			...this.compilerOptions,
			target: ScriptTarget.ES2018,
			declaration: false,
			isolatedModules: true,
			composite: false,
			incremental: false,
			...overrideOptions,
			module: ModuleKind.CommonJS,
		};
	}

	public walkSourceFile(_transformationContext: TransformationContext, sourceFile: SourceFile) {
		const cjsResult = transpileModule(sourceFile.getFullText(), {
			compilerOptions: this.compilerOptions,
			fileName: sourceFile.fileName,
			moduleName: sourceFile.moduleName,
			reportDiagnostics: true,
			transformers: { before: [this.transformer] },
		});

		const output = getOutputFileNames(
			{
				options: this.compilerOptions,
				fileNames: [sourceFile.fileName],
				errors: [],
			},
			sourceFile.fileName,
			false
		);

		if (!output.length) {
			throw new Error('No output for file: ' + sourceFile.fileName);
		}
		const f = output[0].replace(/\.js$/, '');
		const d = dirname(f);

		if (!existsSync(d)) {
			mkdirpSync(d);
		}
		writeFileSync(f + '.cjs', cjsResult.outputText);
		if (cjsResult.sourceMapText) {
			writeFileSync(f + '.cjs.map', cjsResult.sourceMapText);
		}
	}
}

function mkdirpSync(d: string) {
	const p = dirname(d);
	if (!existsSync(p)) {
		mkdirpSync(p);
	}
	mkdirSync(d);
}
