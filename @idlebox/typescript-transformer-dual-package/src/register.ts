import { Program, CompilerOptions } from 'typescript';
import { CjsCompiler } from './cjsCompiler';
import { _createExtensionTransformerInternal } from './lib';

interface IOptions {
	compilerOptions?: CompilerOptions;
}

export default function plugin(program: Program, pluginOptions: IOptions) {
	const trans = new CjsCompiler(program.getCompilerOptions(), pluginOptions.compilerOptions || {});
	return _createExtensionTransformerInternal('.js', (transformationContext, sourceFile) => {
		trans.walkSourceFile(transformationContext, sourceFile);
	});
}
