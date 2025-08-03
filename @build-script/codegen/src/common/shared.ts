import { createArgsReader } from '@idlebox/args';
import { relativePath } from '@idlebox/common';
import type { IResult } from './code-generator-holder.js';
import type { ILogger } from './output.js';

export const argv = createArgsReader(process.argv.slice(2));
export const watchMode = argv.flag(['-w', '--watch']) > 0;
export const debugMode = argv.flag(['-d', '--debug']) > 0;
export const verboseMode = argv.flag(['-d', '--debug']) > 1;
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

export function formatResult(result: IResult) {
	if (result.errors.length === 0) return '';

	const msgs: string[] = [];

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
		const loc = rel.startsWith('..') ? source : rel;
		msgs.push(`\x1B[2m${line}\r-- ${loc} \x1B[0m`);
		for (const error of errors) {
			msgs.push(error.stack ?? error.message);
			msgs.push('');
		}
	}

	return msgs.join('\n');
}
