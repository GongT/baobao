import { CompilerOptions, Program } from 'typescript';
import { CjsCompiler } from './cjs.compiler';
import { createExtensionTransformer } from './lib';
import { createExtensionWithCache } from './transformerCache';

import { setFlagsFromString } from 'v8';
setFlagsFromString('--stack-size=2048');

interface IOptions {
	compilerOptions?: CompilerOptions;
	verbose?: boolean;
}

export { ITestInterface } from './cjs.compiler';

const cache = createExtensionWithCache(function typescriptTransformerDualPackageReal(
	program: Program,
	pluginOptions: IOptions
) {
	const trans: CjsCompiler = new CjsCompiler(!!pluginOptions.verbose);
	trans.updateConfig(program, pluginOptions.compilerOptions || {});
	return createExtensionTransformer('.js', program, (_transformationContext, sourceFile) => {
		trans.walkSourceFile(sourceFile.fileName);
	});
});

export default function typescriptTransformerDualPackage(program: Program, pluginOptions: IOptions) {
	return cache(program, pluginOptions);
}
