import { createStackTraceHolder, functionName } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import assert from 'node:assert';

type FN = () => Promise<any>;
const calls: { stack: { stack: string }; fn: FN }[] = [];

export function singleCall(fn: () => Promise<any>) {
	const et = createStackTraceHolder('', singleCall);
	calls.push({ stack: et, fn });
	if (calls.length === 1) {
		exec();
	}
}

function exec() {
	if (calls.length === 0) {
		return;
	}

	const { fn, stack } = calls[0];
	fn()
		.catch((e) => {
			const stackstr = stack.stack;
			const st = stackstr.slice(stackstr.indexOf('\n') + 1);

			logger.error`single call function should not throw: ${functionName(fn)}`;
			logger.warn(`${e.message}\n${st}`);
			calls.length = 0;

			e.stack += '\n--\n';
			e.stack += st;
			process.nextTick(() => {
				throw e;
			});
		})
		.finally(() => {
			const { fn: should } = calls.shift() ?? {};
			assert.strictEqual(should, fn, 'call stack mutated during execution');
			exec();
		});
}
