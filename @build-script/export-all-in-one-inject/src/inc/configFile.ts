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

let options: ParsedCommandLine;

export function getOptions(file?: string): ParsedCommandLine {
	if (file) {
		console.log('using file: %s', file);
		return parse(file);
	}
	if (!options) {
		console.log('using file: %s', CONFIG_FILE);
		options = parse(CONFIG_FILE);
	}
	return options;
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
		useCaseSensitiveFileNames: true,
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
