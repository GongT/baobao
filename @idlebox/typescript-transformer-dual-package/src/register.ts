import {
	CompilerOptions,
	Program,
	SourceFile,
	TransformationContext,
	Transformer,
	TransformerFactory,
} from 'typescript';
import { getDebug, IDebug } from './debug';
import { appendDotJs } from './append.js';
import { appendDotCjs, cloneProgram } from './append.cjs';
import { selfCreatedProgram } from './preventLoop';

export { ISelfTest } from './self.test';

interface IOptions {
	compilerOptions?: CompilerOptions;
	verbose?: boolean;
}

console.error('\x1Bc');

export interface ITransformerSlice {
	(program: Program, transformationContext: TransformationContext, debug: IDebug): Transformer<SourceFile>;
}

let lastProgram: Program;
let cachedTransformer: TransformerFactory<SourceFile>;

export default function typescriptTransformerDualPackage(program: Program, pluginOptions: IOptions) {
	const debug = getDebug(!!pluginOptions.verbose);

	if (selfCreatedProgram in program) {
		return () => {
			(node: SourceFile) => node;
		};
	}
	if (program === lastProgram) {
		return cachedTransformer;
	}
	lastProgram = program;

	const shadowProgram = cloneProgram(program, pluginOptions.compilerOptions || {}, debug);
	const appendDotCjsCall = appendDotCjs(shadowProgram, debug);

	return (cachedTransformer = function transformer(transformationContext: TransformationContext) {
		debug('[trans] NewContext');

		const appendDotJsCall = appendDotJs(program, transformationContext, debug);

		return (sourceFile: SourceFile) => {
			appendDotCjsCall(sourceFile);
			return appendDotJsCall(sourceFile);
		};
	});
}
