import { normalize } from 'path';
import {
	Diagnostic,
	formatDiagnostic,
	FormatDiagnosticsHost,
	getParsedCommandLineOfConfigFile,
	ParseConfigFileHost,
	ParsedCommandLine,
	sys,
} from 'typescript';
import { CONFIG_FILE } from './argParse';

let command: ParsedCommandLine;

export function getOptions(file?: string): ParsedCommandLine {
	if (file) {
		return parse(file);
	}
	if (!command) {
		command = parse(CONFIG_FILE);

		if (!command.options.outDir) {
			throw new Error('Invalid project: no outDir in tsconfig.json.');
		}
	}
	return command;
}

function parse(file: string) {
	const myFormatDiagnosticsHost: FormatDiagnosticsHost = {
		getCurrentDirectory: sys.getCurrentDirectory,
		getCanonicalFileName: normalize,
		getNewLine(): string {
			return sys.newLine;
		},
	};

	const myParseConfigFileHost: ParseConfigFileHost = {
		onUnRecoverableConfigFileDiagnostic(diagnostic: Diagnostic) {
			console.error(formatDiagnostic(diagnostic, myFormatDiagnosticsHost));
		},
		useCaseSensitiveFileNames: false,
		readDirectory: sys.readDirectory,
		fileExists: sys.fileExists,
		readFile: sys.readFile,
		getCurrentDirectory: sys.getCurrentDirectory,
	};

	const ret = getParsedCommandLineOfConfigFile(file, {}, myParseConfigFileHost);
	if (!ret) {
		throw new Error('Cannot parse content of file "' + file + '"');
	}
	return ret;
}
