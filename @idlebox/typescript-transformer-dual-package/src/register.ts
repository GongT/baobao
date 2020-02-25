import { CompilerOptions, Program } from 'typescript';
import { CjsCompiler } from './cjs.compiler';
import { _createExtensionTransformerInternal } from './lib';

interface IOptions {
	compilerOptions?: CompilerOptions;
}

export default function plugin(program: Program, pluginOptions: IOptions) {
	const trans = new CjsCompiler(program, pluginOptions.compilerOptions || {});
	return _createExtensionTransformerInternal('.js', program, (transformationContext, sourceFile) => {
		trans.walkSourceFile(transformationContext, sourceFile);
	});
}
