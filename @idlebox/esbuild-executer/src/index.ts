import { error } from 'node:console';
import module from 'node:module';
import { MessageChannel } from 'node:worker_threads';
import { debugs, inspectEnabled, isTrue } from './common/cli.js';
import type { IDebugMessage, IErrorMessage, IExecuteOptions, IImportedMessage, IInitializeMessage, ISourceMapMessage, IWarningMessage } from './common/message.types.js';
export type { IExecuteOptions };

const schema = /^file:\/\//;
// const tsExt = /\.ts$/;

const debugMap = debugs.master.extend('source-map');

export async function execute(tsFile: string, options?: IExecuteOptions) {
	if (!tsFile.startsWith('file:')) {
		throw new Error(`execute() must be a file:// URL, got: ${tsFile}`);
	}

	const sourceMaps = new Map<string, any>();
	await registerSourceMap(sourceMaps);

	const { port1, port2 } = new MessageChannel();
	port1.on('message', (data: ISourceMapMessage | IDebugMessage | IWarningMessage | IInitializeMessage | IErrorMessage) => {
		if (data.type === 'source-map') {
			debugMap(`received source map for: ${data.fileUrl}`);
			sourceMaps.set(data.fileUrl, JSON.parse(Buffer.from(data.sourceMap).toString('utf-8')));
		} else if (data.type === 'debug') {
			debugs[data.kind]('\x1B[2m%s\x1B[0m', data.message);
		} else if (data.type === 'warning') {
			error(data.message);
		} else if (data.type === 'initialize' || data.type === 'error') {
			// empty
		} else {
			debugs.master(`unknown message type: ${JSON.stringify(data)}`);
		}
	});
	const ready = new Promise<string>((resolve, reject) => {
		function waitForPort(data: IInitializeMessage | IErrorMessage) {
			if (data.type === 'initialize') {
				port1.off('message', waitForPort);
				debugs.master('port1 is ready');
				resolve(data.entryFileUrl);
			} else if (data.type === 'error') {
				const e = new Error(`import worker error: ${data.message}`);
				e.stack = data.stack;
				reject(e);
			}
		}
		port1.on('message', waitForPort);
	});

	debugs.master('register worker');
	module.register(import.meta.resolve('./hook-worker.js'), {
		data: { options, tsFile, port: port2 },
		transferList: [port2],
	});

	debugs.master('watting for worker to be ready');
	const entryFileUrl = await ready;
	port1.unref();
	debugs.master('worker is ready!');

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
		debugMap('register source-map');
		const { install } = await import('source-map-support');
		install({
			retrieveSourceMap(source) {
				const map = sourceMaps.get(source);
				if (map) {
					debugMap(`matched source map for: ${source}`);
					return { url: source.replace(schema, ''), map: map };
				}
				debugMap(`need to resolve source map for: ${source}`);
				return null;
			},
		});
	} else {
		debugMap('not register source-map');
	}
}
