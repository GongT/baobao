import { writeFileSync } from 'fs';
import {
	CompilerOptions,
	getOutputFileNames,
	ModuleKind,
	ScriptTarget,
	SourceFile,
	TransformerFactory,
	transpileModule,
	TransformationContext,
} from 'typescript';
import { createExtensionTransformer } from './lib';

export class CjsCompiler {
	private readonly compilerOptions: CompilerOptions;
	private readonly transformer: TransformerFactory<SourceFile>;

	constructor(compilerOptions: CompilerOptions, overrideOptions: CompilerOptions) {
		this.transformer = createExtensionTransformer('.cjs');
		this.compilerOptions = {
			...compilerOptions,
		};
		delete this.compilerOptions.project;
		delete this.compilerOptions.tsBuildInfoFile;
		this.compilerOptions = {
			...this.compilerOptions,
			target: ScriptTarget.ES2018,
			module: ModuleKind.CommonJS,
			declaration: false,
			isolatedModules: true,
			composite: false,
			incremental: false,
			...overrideOptions,
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

		writeFileSync(f + '.cjs', cjsResult.outputText);
		if (cjsResult.sourceMapText) {
			writeFileSync(f + '.cjs.map', cjsResult.sourceMapText);
		}
	}
}
