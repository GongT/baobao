import { default as plugin } from '@idlebox/typescript-transformer-dual-package';
import { dirname } from 'path';
import {
	ScriptTarget,
	CompilerHost,
	CompilerOptions,
	createCompilerHost,
	createProgram,
	formatDiagnostics,
	Program,
	SourceFile,
	ModuleKind,
	CustomTransformers,
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
		module: originalOptions.module,
		outDir: originalOptions.outDir,
	};
	const host = createCompilerHost(options, true);
	const program: Program = createProgram([targetIndexFile], options, host);

	const source = program.getSourceFile(targetIndexFile);

	Error.stackTraceLimit = Infinity;

	const trans = createTransform(program, options);

	const ret = program.emit(source, createWriteFile(host), undefined, false, trans);
	if (ret.diagnostics.length) {
		console.error(formatDiagnostics(ret.diagnostics, host));
	}
}
function createTransform(program: Program, options: CompilerOptions): CustomTransformers | undefined {
	if (options.module) {
		if (options.module > ModuleKind.System) {
			return {
				before: [plugin(program, {})],
			};
		}
	} else if (options.target) {
		if (options.target > ScriptTarget.ES5) {
			return {
				before: [plugin(program, {})],
			};
		}
	}
	return undefined;
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
