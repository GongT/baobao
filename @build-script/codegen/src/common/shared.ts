import { createArgsReader } from '@idlebox/args';
import { relativePath } from '@idlebox/common';
import type { IResult } from './code-generator-holder.js';
import type { ILogger } from './output.js';

export const argv = createArgsReader(process.argv.slice(2));
export const watchMode = argv.flag(['-w', '--watch']) > 0;
export const debugMode = argv.flag(['-d', '--debug']) > 0;
export const verboseMode = argv.flag(['-v', '--verbose']) > 0 || debugMode;
export const colorMode = process.stderr.isTTY;

export enum ExecuteReason {
	NoNeed = 0,
	NeedCompile = 1,
	NeedExecute = 2,
}

export const knownLevels = ['error', 'notice', 'warn', 'success', 'info', 'log', 'debug', 'verbose', 'die'] as const;
export interface ILogMessage {
	readonly type: (typeof knownLevels)[number];
	readonly message: string;
}

export function createCollectLogger(outputs: ILogMessage[], pipe: ILogger): ILogger {
	const child: ILogger = {} as any;
	for (const key of knownLevels) {
		child[key] = (message: string) => {
			pipe[key](message);
			outputs.push({
				type: key,
				message: message,
			});
		};
	}
	return child;
}

export async function printResult(result: IResult, logger: ILogger) {
	if (result.errors.length > 0) {
		logger.boom(`generate fail: ${result.errors.length} errors`);
		const categories = new Map<string, Error[]>();
		for (const { error, source } of result.errors) {
			if (!categories.has(source)) {
				categories.set(source, []);
			}
			categories.get(source)?.push(error);
		}

		const line = '-'.repeat(process.stderr.columns || 80);
		for (const [source, errors] of categories) {
			const rel = relativePath(process.cwd(), source);
			console.error('\x1B[2m%s\r-- %s \x1B[0m', line, rel.startsWith('..') ? source : rel);
			for (const error of errors) {
				console.error(error.stack);
				console.error('');
			}
		}

		return false;
	}

	logger.checked(`generate complete`);
	return true;
}
