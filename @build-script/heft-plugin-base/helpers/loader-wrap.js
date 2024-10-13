if (process.argv.includes('--debug')) {
	console.log('[plugin-base] development mode: using in-memory loader.');
}
const src = require.resolve('../src/loader.ts');
const ts = require('typescript');
const fs = require('fs');
const { Module } = require('module');

const mdl = new Module(src, module);
const content = fs.readFileSync(src, 'utf8');
const result = ts.transpileModule(content, {
	compilerOptions: {
		module: ts.ModuleKind.CommonJS,
		esModuleInterop: true,
	},
	fileName: src,
}).outputText;

mdl._compile(result, __filename);

module.exports = mdl.exports;
