import assert from 'node:assert';
import module from 'node:module';
import { isMainThread, MessageChannel } from 'node:worker_threads';
import { earlyLoaderState, ensureGlobalObject } from '../common/early-loader-bridge.js';
import { DebugMessageKind, isTypeOf, type InitializeData, type IQuitMessage } from '../common/message.types.js';
import { debugOutpus, inspectEnabled, isTrue, masterOutput } from './cli.js';
import { receivePingMessage } from './misc-protocol.js';
import { onReceiveCompiledFile } from './request-bridge.js';
import { addVirtualSourceMap, registerSourceMapper } from './source-map-resolver.js';

assert.equal(isMainThread, true, 'Worker引用了主线程代码');
const debug = masterOutput('');

const globalState = ensureGlobalObject(`esbuild-executer-worker-state`, () => {
	let cleanTimeout: NodeJS.Timeout | undefined;
	let port: MessagePort | undefined;
	let promise: Promise<MessagePort> | undefined;
	let workerReady = false;

	function keepAlive() {
		if (cleanTimeout) clearTimeout(cleanTimeout);
		cleanTimeout = setTimeout(destroy, 1000);
	}
	function destroy() {
		if (port) port.postMessage({ type: 'quit' } satisfies IQuitMessage);

		cleanTimeout = undefined;
		port = undefined;
		promise = undefined;
		workerReady = false;
	}

	return {
		get workerReady() {
			return workerReady;
		},
		get promise() {
			return promise;
		},
		make(construct: () => Promise<MessagePort>) {
			if (!promise) {
				Error.stackTraceLimit = Infinity;
				promise = construct().then((newPort) => {
					workerReady = true;
					port = newPort;
					port.on('data', keepAlive);
					return newPort;
				});
			}
			return promise;
		},
		dispose: destroy,
		get port() {
			return port;
		},
	};
});

export function wantPort() {
	return globalState.port;
}
export function getPort() {
	if (!globalState.port) {
		throw new Error('worker port is not ready');
	}
	return globalState.port;
}

export function registerWorkerIfNot() {
	if (globalState.promise) return globalState.promise;

	const promise = globalState.make(startWorker);
	promise.then(initialized);

	return promise;

	function initialized(port: MessagePort) {
		port.on('message', (data: unknown) => {
			if (isTypeOf(data, 'source-map')) {
				addVirtualSourceMap(data.fileUrl, JSON.parse(Buffer.from(data.sourceMap).toString('utf-8')));
			} else if (isTypeOf(data, 'outputs')) {
				if (data.kind === DebugMessageKind.output) {
					debugOutpus[data.kind](data.message);
				} else if (data.kind === DebugMessageKind.error) {
					debugOutpus[data.kind](draw(data.message, '31'));
				} else {
					debugOutpus[data.kind](draw(data.message, '2'));
				}
			} else if (isTypeOf(data, 'compiled')) {
				onReceiveCompiledFile(data);
			} else if (isTypeOf(data, 'pong')) {
				if (data.id) receivePingMessage(data.id);
			} else if (isTypeOf(data, 'refresh')) {
				// 用于重设退出timer，此处不处理
			} else {
				throw new Error(`unknown message type: ${JSON.stringify(data)}`);
			}
		});

		port.on('close', () => {
			debug('ok, worker port closed');
			globalState.dispose();
		});
	}

	async function startWorker() {
		registerSourceMapper();

		// 创建和worker的通信通道，其中port1主进程留下，port2传给worker
		const { port1: master, port2: slave } = new MessageChannel();

		debug('register worker');
		const hookWorkerEntryFile = earlyLoaderState.hookEntry ?? '../hook-worker.js';
		module.register(import.meta.resolve(hookWorkerEntryFile), {
			data: {
				port: slave,
				inspectMode: inspectEnabled,
				writeTempFiles: isTrue('WRITE_COMPILE_RESULT'),
				earlyLoaderEntry: earlyLoaderState.mainEntry || false,
			} satisfies InitializeData,
			transferList: [slave],
		});

		debug('watting for worker to be ready');
		await new Promise<void>((resolve, reject) => {
			function waitForPort(data: unknown) {
				debug('receive message from channel!');

				if (isTypeOf(data, 'initialize')) {
					resolve();
				} else {
					reject(new Error(`unexpected first message: ${JSON.stringify(data)}`));
				}
			}
			master.once('message', waitForPort);
		});

		slave.unref();
		master.unref(); // 让主线程退出时不等待
		debug('worker is ready!');

		return master;
	}
}

function draw(text: string, color: string) {
	return `\x1b[${color}m${text.replace(/\n/g, `\x1b[0m\n\x1b[${color}m`)}\x1b[0m`;
}
