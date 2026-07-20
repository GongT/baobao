import { createArgsReader } from '@idlebox/args';
import { prettyFormatError, relativePath } from '@idlebox/common';
import type { IResult } from './code-generator-holder.js';

const argv = createArgsReader(process.argv.slice(2));
export const watchMode = argv.flag(['-w', '--watch']) > 0;
export const debugMode = argv.flag(['-d', '--debug']) > 0;
export const verboseMode = argv.flag(['-d', '--debug']) > 1;
export const showHelp = argv.flag(['-h', '--help']) > 0;
export const serialMode = argv.flag(['-S', '--serial']) > 0;
export const colorMode = process.stderr.isTTY;
export const remainingArgs = argv.unused();

export enum ExecuteReason {
	NoNeed = 0,
	NeedCompile = 1,
	NeedExecute = 2,
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

	const line = '-'.repeat(60);
	for (const [source, errors] of categories) {
		const rel = relativePath(process.cwd(), source);
		const loc = rel.startsWith('..') ? source : rel;

		const title = ` -- codegen @ ${loc} ${line}`;
		msgs.push(`\x1B[2m${title}\x1B[0m`);
		for (const error of errors) {
			msgs.push(prettyFormatError(error));

			let cause = error.cause;
			while (cause && typeof cause === 'object' && 'stack' in cause) {
				msgs.push(`[Caused by] ${prettyFormatError(cause as Error, true, false)}`);
				cause = (cause as Error).cause;
			}

			msgs.push('');
		}
		msgs.push(`\x1B[2m${'~'.repeat(title.length)}\x1B[0m`);
	}

	return msgs.join('\n');
}

type AsyncNoArg<T> = () => Promise<T>;

/**
 * 包装EXEC函数，使得在EXEC执行期间的所有调用都会被忽略，直到EXEC执行完成后才会再次执行。
 * 如果在EXEC执行期间有多次调用，则只会执行最后一次调用。
 * 并且包括第一次在内的所有调用都会返回同一个Promise对象
 */
export function makeQueuedLatest<T>(EXEC: AsyncNoArg<T>) {
	let running = false;
	let queued = 0; // number of calls made while running
	let waiters: Array<{ resolve: (v: T) => void; reject: (e: unknown) => void }> = [];

	const runLoop = async () => {
		running = true;

		// Keep rerunning until a run completes with no new queued calls
		for (;;) {
			queued = 0; // new calls during this run will increment this

			let value!: T;
			let error: unknown;
			let ok = false;

			try {
				value = await EXEC();
				ok = true;
			} catch (e) {
				error = e;
			}

			if (queued > 0) {
				// Calls came in during this run -> drop this result and rerun
				continue;
			}

			// Stable newest result: settle everyone waiting (first + queued calls)
			const current = waiters;
			waiters = [];
			running = false;

			for (const w of current) {
				if (ok) {
					w.resolve(value);
				} else {
					w.reject(error);
				}
			}
			return;
		}
	};

	return function wrapped(): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			waiters.push({ resolve, reject });

			if (running) {
				queued++;
				return;
			}

			void runLoop();
		});
	};
}
