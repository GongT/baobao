import type { IScopedLogger } from '@rushstack/heft';
import { FileError } from '@rushstack/node-core-library';
import type TypeScriptApi from 'typescript';
import { IHeftJsonOptions } from './type';

export class CustomDiagnosticPrinter {
	private readonly diagnostics: TypeScriptApi.Diagnostic[] = [];
	constructor(
		private readonly ts: typeof TypeScriptApi,
		private readonly rootDir: string,
		private readonly options: IHeftJsonOptions,
		private readonly logger: IScopedLogger,
	) {}

	public add(...diagnosticsArrays: ReadonlyArray<TypeScriptApi.Diagnostic>[]) {
		for (const diagnostics of diagnosticsArrays) {
			this.diagnostics.push(...diagnostics);
		}
		return this;
	}

	public print() {
		this._not_recoverable_error_found = false;
		this.do_print(this.diagnostics);
		this.diagnostics.length = 0;
		return this;
	}

	private _not_recoverable_error_found = false;
	get shouldFail() {
		return this._not_recoverable_error_found;
	}

	private is_node_modules_error(diagnostic: TypeScriptApi.Diagnostic) {
		if (!diagnostic.file) {
			return true; // what is that?
		}
		if (diagnostic.file.fileName.startsWith(this.rootDir)) {
			const rel = diagnostic.file.fileName.substring(this.rootDir.length);
			if (rel.includes('/node_modules/')) {
				return true;
			}
		} else {
			this.logger.terminal.writeWarningLine('found error from out-of-worktree:' + diagnostic.file.fileName);
		}
		return false;
	}

	private map_error_level(diagnostic: TypeScriptApi.Diagnostic) {
		const config = [
			[this.options.errorLevels.error, this.ts.DiagnosticCategory.Error],
			[this.options.errorLevels.warning, this.ts.DiagnosticCategory.Warning],
			[this.options.errorLevels.notice, this.ts.DiagnosticCategory.Suggestion],
		] as const;
		for (const [list, mapTo] of config) {
			if (list.includes(diagnostic.code)) {
				diagnostic.category = mapTo;
				break;
			}
		}
	}

	private do_print(diagnostics: readonly TypeScriptApi.Diagnostic[]) {
		diagnostics = this.ts.sortAndDeduplicateDiagnostics(diagnostics || []);
		// console.log('sortedDiagnostics', sortedDiagnostics.length);

		let warningCount = 0;
		let errorCount = 0;
		let ignoreCount = 0;
		let skipCount = 0;

		for (const diagnostic of diagnostics) {
			if (this.options.skipNodeModules && this.is_node_modules_error(diagnostic)) {
				skipCount++;
				continue;
			}
			this.map_error_level(diagnostic);

			// The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.
			// if (diagnostic.code === 1343) continue;

			if (diagnostic.category === this.ts.DiagnosticCategory.Warning) {
				warningCount++;
				if (this.options.warningAsError) this._not_recoverable_error_found = true;
			} else if (diagnostic.category === this.ts.DiagnosticCategory.Error) {
				errorCount++;
				this._not_recoverable_error_found = true;
			} else {
				ignoreCount++;
			}

			this.print_line(diagnostic);
		}

		let message: string[] = [];

		if (warningCount || errorCount) {
			const s1 = errorCount === 1 ? '' : 's';
			const s2 = warningCount === 1 ? '' : 's';
			message.push(`TypeScript encountered ${errorCount} error${s1} and ${warningCount} warning${s2}.`);
		}
		if (ignoreCount) {
			const s = ignoreCount === 1 ? '' : 's';
			message.push(`${ignoreCount} diagnostic${s} in verbose mode.`);
		}
		if (skipCount) {
			const s = skipCount === 1 ? '' : 's';
			message.push(`${skipCount} node_module diagnostic${s} skipped.`);
		}

		if (warningCount || errorCount) {
			this.logger.terminal.writeErrorLine(message.join(' '));
		} else if (ignoreCount || skipCount) {
			this.logger.terminal.writeWarningLine(message.join(' '));
		} else {
			this.logger.terminal.writeVerboseLine('no error/warnings.');
		}
	}

	private print_line(diagnostic: TypeScriptApi.Diagnostic) {
		// Code taken from reference example
		let diagnosticMessage: string;
		let errorObject: Error;
		if (diagnostic.file) {
			const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
			const message = this.ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			const formattedMessage = `(TS${diagnostic.code}) ${message}`;
			errorObject = new FileError(formattedMessage, {
				absolutePath: diagnostic.file.fileName,
				projectFolder: this.rootDir,
				line: line + 1,
				column: character + 1,
			});
			diagnosticMessage = errorObject.toString();
		} else {
			diagnosticMessage = this.ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			errorObject = new Error(diagnosticMessage);
		}
		if (this.options.fast) {
			this.logger.terminal.writeWarningLine(...diagnosticMessage);
			return;
		}
		switch (diagnostic.category) {
			case this.ts.DiagnosticCategory.Error:
				this.logger.emitError(errorObject);
				break;
			case this.ts.DiagnosticCategory.Warning:
				this.logger.emitWarning(errorObject);
				break;
			case this.ts.DiagnosticCategory.Suggestion:
				this.logger.terminal.writeDebugLine(diagnosticMessage);
				break;
			default:
				this.logger.terminal.writeLine(diagnosticMessage);
				break;
		}
	}
}
