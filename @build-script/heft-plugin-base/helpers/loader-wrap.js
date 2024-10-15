function heftPluginBaseLoaderWrap() {
	if (process.argv.includes('--debug')) {
		console.log('[heft-plugin-base/loader] development mode: using in-memory loader.');
	}
	const src = require.resolve('../src/loader.ts');
	const ts = require('typescript');
	const fs = require('fs');
	const path = require('path');
	const { Module } = require('module');

	const content = fs.readFileSync(src, 'utf8');
	const result = ts.transpileModule(content, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			esModuleInterop: true,
			sourceMap: true,
			inlineSourceMap: false,
			sourceRoot: path.dirname(src),
		},
		fileName: src,
	});

	const sourcemap = JSON.parse(result.sourceMapText);
	// console.log(sourcemap);
	let sourceCode = result.outputText.replace('//# sourceMappingURL=', '////');

	sourceCode += '\n\n//# sourceMappingURL=data:application/json;base64,';
	sourceCode += Buffer.from(JSON.stringify(sourcemap)).toString('base64');

	module._compile(sourceCode, __filename);
}
heftPluginBaseLoaderWrap();
