import type TypeScriptApi from 'typescript';
import type { IScopedLogger } from '@rushstack/heft';
import { FileError } from '@rushstack/node-core-library';

export function printCompileDiagnostic(
	ts: typeof TypeScriptApi,
	rootDir: string,
	logger: IScopedLogger,
	diagnostics: readonly TypeScriptApi.Diagnostic[]
) {
	if (!diagnostics.length) {
		logger.terminal.writeLine(``);
	}

	logger.terminal.writeLine(
		`Encountered ${diagnostics.length} TypeScript issue${diagnostics.length > 1 ? 's' : ''}:`
	);
	let warningCount = 0;
	let hasError = false;

	for (const diagnostic of diagnostics) {
		if (diagnostic.category === ts.DiagnosticCategory.Warning) {
			warningCount++;
		} else if (diagnostic.category === ts.DiagnosticCategory.Error) {
			hasError = true;
		}
		_printDiagnosticMessage(ts, rootDir, logger, diagnostic);
	}

	if (warningCount > 0 && !hasError) {
		logger.emitError(new Error(`TypeScript encountered ${warningCount} warning${warningCount === 1 ? '' : 's'}`));
	}
}

function _printDiagnosticMessage(
	ts: typeof TypeScriptApi,
	rootDir: string,
	logger: IScopedLogger,
	diagnostic: TypeScriptApi.Diagnostic
) {
	// Code taken from reference example
	let diagnosticMessage;
	let errorObject;
	if (diagnostic.file) {
		const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		const formattedMessage = `(TS${diagnostic.code}) ${message}`;
		errorObject = new FileError(formattedMessage, {
			absolutePath: diagnostic.file.fileName,
			projectFolder: rootDir,
			line: line + 1,
			column: character + 1,
		});
		diagnosticMessage = errorObject.toString();
	} else {
		diagnosticMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		errorObject = new Error(diagnosticMessage);
	}
	switch (diagnostic.category) {
		case ts.DiagnosticCategory.Error:
			logger.emitError(errorObject);
			break;
		case ts.DiagnosticCategory.Warning:
			logger.emitWarning(errorObject);
			break;
		default:
			logger.terminal.writeLine(...diagnosticMessage);
			break;
	}
}
