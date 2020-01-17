// @ts-ignore
import { default as plugin } from '@idlebox/typescript-transformer-dual-package';
import { dirname } from 'path';
import {
	CompilerOptions,
	CompilerHost,
	createCompilerHost,
	createProgram,
	formatDiagnostics,
	Program,
	SourceFile,
} from 'typescript';
import { targetIndexFile } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { debug } from '../inc/debug';

export function transpileIndexFile() {
	console.log('\x1B[38;5;10mcreate index file(s).\x1B[0m');
	const originalOptions = getOptions().options;
	const options: CompilerOptions = {
		...originalOptions,
		rootDir: dirname(targetIndexFile),
		sourceMap: false,
		inlineSourceMap: originalOptions.sourceMap,
		inlineSources: originalOptions.sourceMap,
	};
	const host = createCompilerHost(options, true);
	const program: Program = createProgram([targetIndexFile], options, host);

	const source = program.getSourceFile(targetIndexFile);

	Error.stackTraceLimit = Infinity;
	const ret = program.emit(source, createWriteFile(host), undefined, false, {
		before: [plugin(program, {})],
	});
	if (ret.diagnostics.length) {
		formatDiagnostics(ret.diagnostics, host);
	}
}
function createWriteFile(host: CompilerHost) {
	return function writeFile(
		fileName: string,
		data: string,
		writeByteOrderMark: boolean,
		onError?: (message: string) => void,
		sourceFiles?: readonly SourceFile[]
	) {
		debug('  write: %s', fileName);
		return host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
	};
}
