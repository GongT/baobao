import { default as plugin } from '@idlebox/typescript-transformer-dual-package';
import { dirname } from 'path';
import {
	CompilerHost,
	CompilerOptions,
	createCompilerHost,
	createProgram,
	formatDiagnostics,
	Program,
	SourceFile,
} from 'typescript';
import { targetIndexFile } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { debug } from '../inc/debug';

export async function transpileIndexFile() {
	console.log('\x1B[38;5;10mcreate index file(s).\x1B[0m');
	debug('targetIndexFile=%s', targetIndexFile);

	const originalOptions = getOptions().options;
	const options: CompilerOptions = {
		rootDir: dirname(targetIndexFile),
		sourceMap: false,
		inlineSourceMap: originalOptions.sourceMap || originalOptions.inlineSourceMap,
		inlineSources: originalOptions.sourceMap || originalOptions.inlineSourceMap,
		target: originalOptions.target,
		outDir: originalOptions.outDir,
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
		return host.writeFile(fileName, data + '\n', writeByteOrderMark, onError, sourceFiles);
	};
}
