import { type IExtendParsedCommandLine, loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { dirname } from 'node:path';
import ts from 'typescript';

export function getOptions(file: string, checkOut = false): IExtendParsedCommandLine {
	const command = loadTsConfigJsonFile(file, ts);

	if (checkOut && command.options.outDir === dirname(command.options.configFilePath)) {
		throw new Error('Invalid project: outDir is not set or same with source directory in tsconfig.json.');
	}

	return command;
}
