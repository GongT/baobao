import module from 'node:module';
import { MessageChannel } from 'node:worker_threads';
import {
	DebugMessageKind,
	type IDebugMessage,
	type IExecuteOptions,
	type IImportedMessage,
	type IInitializeMessage,
	type IQuitMessage,
	type ISourceMapMessage,
} from './common/message.types.js';
import { createMaster, inspectEnabled, isTrue } from './master/cli.js';

export type { IExecuteOptions };

const schema = /^file:\/\//;
// const tsExt = /\.ts$/;

const debugOutpus = createMaster();
const debugMap = debugOutpus.master.extend('source-map');

function draw(text: string, color: string) {
	return `\x1b[${color}m${text.replace(/\n/g, `\x1b[0m\n\x1b[${color}m`)}\x1b[0m`;
}

const hookWorkerEntryFile = (globalThis as any).hookWorkerEntryFile ?? './hook-worker.js';

export async function execute(tsFile: string, options?: IExecuteOptions) {
	if (!tsFile.startsWith('file:')) {
		throw new Error(`execute() must be a file:// URL, got: ${tsFile}`);
	}
	Error.stackTraceLimit = Infinity;

	const sourceMaps = new Map<string, any>();
	await registerSourceMap(sourceMaps);

	const { port1, port2 } = new MessageChannel();
	port1.on('message', (data: ISourceMapMessage | IDebugMessage | IQuitMessage | IInitializeMessage) => {
		if (data.type === 'source-map') {
			debugMap(`received source map for: ${data.fileUrl}`);
			sourceMaps.set(data.fileUrl, JSON.parse(Buffer.from(data.sourceMap).toString('utf-8')));
		} else if (data.type === 'outputs') {
			if (data.kind === DebugMessageKind.output) {
				debugOutpus[data.kind](data.message);
			} else if (data.kind === DebugMessageKind.error) {
				debugOutpus[data.kind](draw(data.message, '31'));
			} else {
				debugOutpus[data.kind](draw(data.message, '2'));
			}
		} else if (data.type === 'initialize') {
			// empty
		} else {
			debugOutpus.master(`unknown message type: ${JSON.stringify(data)}`);
		}
	});
	const ready = new Promise<string>((resolve, reject) => {
		function waitForPort(data: IInitializeMessage) {
			if (data.type !== 'initialize') return;

			if (data.success) {
				port1.off('message', waitForPort);
				debugOutpus.master('port1 is ready');
				resolve(data.entryFileUrl);
			} else {
				const e = new Error(`import worker error: ${data.message}`);
				e.stack = data.stack;
				reject(e);
			}
		}
		port1.on('message', waitForPort);
	});

	debugOutpus.master('register worker');
	module.register(import.meta.resolve(hookWorkerEntryFile), {
		data: { options, tsFile, port: port2 },
		transferList: [port2],
	});

	debugOutpus.master('watting for worker to be ready');
	const entryFileUrl = await ready;
	port1.unref();
	debugOutpus.master('worker is ready!');

	process.argv[1] = entryFileUrl;

	const exports = await import(entryFileUrl);

	port1.postMessage({ type: 'imported', quit: !options?.entries?.length } satisfies IImportedMessage);

	return exports;
}

const preventDuplicate = Symbol('duplicate/source-map-support');
async function registerSourceMap(sourceMaps: Map<string, any>) {
	if (Object.hasOwn(globalThis, preventDuplicate)) {
		return;
	}
	Object.defineProperty(globalThis, preventDuplicate, {
		value: true,
		writable: false,
		enumerable: false,
		configurable: false,
	});

	const userDisabled = isTrue('DISABLE_SOURCE_MAP');
	const systemDisabled = inspectEnabled || process.execArgv.includes('--enable-source-maps');

	if (!userDisabled && !systemDisabled) {
		debugMap('register source map');
		const { install } = await import('@idlebox/source-map-support');
		const ok = install({
			retrieveSourceMap: function fromEsbuildExecuter(source) {
				const map = sourceMaps.get(source);
				if (map) {
					debugMap(`matched source map for: ${source}`);
					return { url: source.replace(schema, ''), map: map };
				}
				debugMap(`need to resolve source map for: ${source}`);
				return null;
			},
		});

		debugMap(`source-map-support install result: ${ok}`);
		if (!ok) {
			throw new Error('failed to install source-map-support');
		}
	} else {
		debugMap('not register source map');
	}
}
