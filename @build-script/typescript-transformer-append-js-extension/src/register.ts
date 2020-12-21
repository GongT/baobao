import {
	CompilerOptions,
	Program,
	SourceFile,
	TransformationContext,
	Transformer,
	TransformerFactory,
} from 'typescript';
import { appendDotJs } from './append.js';
import { getDebug, IDebug } from './debug';

interface IOptions {
	compilerOptions?: CompilerOptions;
	verbose?: boolean;
}

export interface ITransformerSlice {
	(program: Program, transformationContext: TransformationContext, debug: IDebug): Transformer<SourceFile>;
}

let lastProgram: Program;
let cachedTransformer: TransformerFactory<SourceFile>;

export default function typescriptTransformerDualPackage(program: Program, pluginOptions: IOptions) {
	const debug = getDebug(pluginOptions.verbose || false);

	if (program === lastProgram) {
		return cachedTransformer;
	}
	lastProgram = program;

	return (cachedTransformer = function transformer(transformationContext: TransformationContext) {
		debug('[trans] NewContext');

		const appendDotJsCall = appendDotJs(program, transformationContext, debug);

		return (sourceFile: SourceFile) => {
			return appendDotJsCall(sourceFile);
		};
	});
}
