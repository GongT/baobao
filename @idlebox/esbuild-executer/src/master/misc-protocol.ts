import assert from 'node:assert';
import type { IPingMessage } from '../common/message.types.js';
import { masterOutput } from './cli.js';
import { registerWorkerIfNot } from './register-worker.js';

const debug = masterOutput('keep-alive');

const flushWatting = new Map<number, PromiseWithResolvers<void>>();

let gid = 1000;

/**
 * 等待日志等全部输出完成，通常在捕获到错误时调用
 */
export async function waitFlush() {
	const id = gid++;

	const promise = Promise.withResolvers<void>();
	flushWatting.set(id, promise);

	const port = await registerWorkerIfNot();
	port.postMessage({
		type: 'ping',
		id: id,
	} satisfies IPingMessage);

	const timeout = setTimeout(() => {
		promise.reject(new Error(`waitFlush timeout after 3s, id: ${id}`));
	}, 3000);

	promise.promise.finally(() => {
		flushWatting.delete(id);
		clearTimeout(timeout);
	});

	return promise.promise;
}

export function receivePingMessage(id: number) {
	const defer = flushWatting.get(id);
	assert.ok(defer, `no watting promise for ping id: ${id} ${dump}`);

	debug(`received ping ${id}`);
	defer.resolve();
}

const dump = {
	toString() {
		return `flushWatting(${flushWatting.size}): ${[...flushWatting.keys()].join(',')}`;
	},
};
