import assert from 'node:assert';
import { isMainThread } from 'node:worker_threads';
import { earlyLoaderState } from '../common/early-loader-bridge.js';
import type { AnyMessage, InitializeData } from '../common/message.types.js';

assert.equal(isMainThread, false, '主线程不应该加载这个模块');

export let messagePort: MessagePort;
export let inspectMode = false;
export let writeTempFiles = false;
let dup: Error | null = null;

export function _set_init_staff({ port, inspectMode: inspect, writeTempFiles: writeTemp, earlyLoaderEntry }: InitializeData) {
	assert.equal(messagePort, null, dup ?? '????????');
	dup = new Error('messagePort is already set');
	messagePort = port;
	inspectMode = inspect;
	writeTempFiles = writeTemp;
	if (earlyLoaderEntry) {
		earlyLoaderState.mainEntry = earlyLoaderEntry;
	}
}

export function postMessage<MessageType extends AnyMessage>(message: MessageType) {
	messagePort.postMessage(message);
}
