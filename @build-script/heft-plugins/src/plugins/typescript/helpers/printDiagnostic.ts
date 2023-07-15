import type TypeScriptApi from 'typescript';
import type { IScopedLogger } from '@rushstack/heft';
import { FileError } from '@rushstack/node-core-library';

export function printCompileDiagnostic(
	ts: typeof TypeScriptApi,
	fast: boolean,
	rootDir: string,
	logger: IScopedLogger,
	diagnostics: readonly TypeScriptApi.Diagnostic[]
) {
	let warningCount = 0;
	let errorCount = 0;

	for (const diagnostic of diagnostics) {
		if (diagnostic.file?.fileName.includes('/node_modules/')) continue;
		if (diagnostic.code === 1343) continue; // The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.

		if (diagnostic.category === ts.DiagnosticCategory.Warning) {
			warningCount++;
		} else if (diagnostic.category === ts.DiagnosticCategory.Error) {
			errorCount++;
		}

		_printDiagnosticMessage(ts, rootDir, logger, diagnostic, fast);
	}

	if (warningCount > 0 || errorCount > 0) {
		const s1 = errorCount === 1 ? '' : 's';
		const s2 = warningCount === 1 ? '' : 's';
		throw new Error(`TypeScript encountered ${errorCount} error${s1} and ${warningCount} warning${s2}`);
	}
}

function _printDiagnosticMessage(
	ts: typeof TypeScriptApi,
	rootDir: string,
	logger: IScopedLogger,
	diagnostic: TypeScriptApi.Diagnostic,
	fast: boolean
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
	if (fast) {
		logger.terminal.writeWarningLine(...diagnosticMessage);
		return;
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
