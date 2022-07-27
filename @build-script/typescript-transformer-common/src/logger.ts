import type { IScopedLogger } from '@rushstack/heft';
import { format } from 'util';
import fancy from 'fancy-log';
import ts from 'typescript';
import { relativePath } from '@idlebox/node';

export interface IDebug {
	debug(message?: string, ...optionalParams: any[]): void;
	log(message?: string, ...optionalParams: any[]): void;
	warn(message?: string, ...optionalParams: any[]): void;
	error(message?: string, ...optionalParams: any[]): void;
	diagnostic(node: ts.Node, message?: string, ...optionalParams: any[]): void;
}

export function printMyDiagnostic(node: ts.Node, message: string, ...args: any[]) {
	console.error(formatMyDiagnostic(node, message, ...args));
}

function diagnosticPrinter(logger: IDebug['log']) {
	return (node: ts.Node, message: string, ...args: any[]) => {
		const pos = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
		logger(
			'%s(%s,%s): ' + message,
			relativePath(process.cwd(), node.getSourceFile().fileName),
			pos.line + 1,
			pos.character,
			...args
		);
	};
}
export function formatMyDiagnostic(node: ts.Node, message: string, ...args: any[]) {
	if (node.getSourceFile()) {
		const pos = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
		return format(
			'%s(%s,%s): ' + message,
			relativePath(process.cwd(), node.getSourceFile().fileName),
			pos.line + 1,
			pos.character,
			...args
		);
	} else {
		return format('(%s failed get position) ' + message, node, ...args);
	}
}

export function getDebug(verbose: boolean): IDebug {
	return {
		debug: verbose ? fancy.info : () => {},
		error: fancy.error,
		log: fancy.info,
		warn: fancy.warn,
		diagnostic: diagnosticPrinter(fancy.info),
	};
}

export function wrapHeftLogger(logger: IScopedLogger, verbose: boolean): IDebug {
	return {
		debug(msg: string, ...args: any[]) {
			if (verbose) {
				logger.terminal.writeLine(format(msg, ...args));
			} else {
				logger.terminal.writeVerboseLine(format(msg, ...args));
			}
		},
		log(msg: string, ...args: any[]) {
			logger.terminal.writeWarningLine(format(msg, ...args));
		},
		warn(msg: string, ...args: any[]) {
			logger.terminal.writeWarningLine(format(msg, ...args));
		},
		error(msg: string, ...args: any[]) {
			logger.terminal.writeErrorLine(format(msg, ...args));
		},
		diagnostic: diagnosticPrinter((msg: string, ...args: any[]) => {
			logger.terminal.writeLine(format(msg, ...args));
		}),
	};
}
