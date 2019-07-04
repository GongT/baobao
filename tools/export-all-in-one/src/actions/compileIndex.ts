import { createCompilerHost, createProgram, Program } from 'typescript';
import { DTS_CONFIG_FILE, targetIndexFile } from '../inc/argParse';
import { getOptions } from '../inc/configFile';

export async function compileIndex() {
	const command = getOptions();
	const dtsCommand = getOptions(DTS_CONFIG_FILE);

	console.log('transpile file %s ...', targetIndexFile);
	command.fileNames = [targetIndexFile];
	command.options.noEmit = false;
	command.options.noEmitOnError = false;
	command.options.declaration = false;
	command.options.emitDeclarationOnly = false;
	command.options.sourceMap = false;
	command.options.sourceRoot = dtsCommand.options.sourceRoot;

	const host = createCompilerHost(command.options, true);
	const program: Program = createProgram([targetIndexFile], command.options, host);
	for (const source of program.getSourceFiles()) {
		if (source.fileName === targetIndexFile) {
			await program.emit(source);
		}
	}
}
