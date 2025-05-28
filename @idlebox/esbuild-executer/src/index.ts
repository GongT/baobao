import module from 'node:module';
import { MessageChannel } from 'node:worker_threads';
import { debugs, isTrue } from './common/cli.js';
import type {
	IDebugMessage,
	IErrorMessage,
	IExecuteOptions,
	IInitializeMessage,
	ISourceMapMessage,
	IWarningMessage,
} from './common/message.types.js';
export type { IExecuteOptions };

const schema = /^file:\/\//;
// const notRelative = /^[^.]/;

export async function execute(tsFile: string, options?: IExecuteOptions) {
	const sourceMaps = new Map<string, any>();
	await registerSourceMap(sourceMaps);

	const { port1, port2 } = new MessageChannel();
	port1.on(
		'message',
		(data: ISourceMapMessage | IDebugMessage | IWarningMessage | IInitializeMessage | IErrorMessage) => {
			// console.log(`received message: ${JSON.stringify(data)}`);
			if (data.type === 'source-map') {
				// console.log(`received source map for: ${data.fileUrl}`);
				sourceMaps.set(data.fileUrl, JSON.parse(Buffer.from(data.sourceMap).toString('utf-8')));
			} else if (data.type === 'debug') {
				debugs[data.kind]('\x1B[2m%s\x1B[0m', data.message);
			} else if (data.type === 'warning') {
				console.error(data.message);
			} else if (data.type === 'initialize' || data.type === 'error') {
				// empty
			} else {
				console.warn(`unknown message type: ${JSON.stringify(data)}`);
			}
		}
	);
	const ready = new Promise<void>((resolve, reject) => {
		function waitForPort(data: IInitializeMessage | IErrorMessage) {
			if (data.type === 'initialize') {
				port1.off('message', waitForPort);
				// console.log('port1 is ready');
				resolve();
			} else if (data.type === 'error') {
				const e = new Error(`import worker error: ${data.message}`);
				e.stack = data.stack;
				reject(e);
			}
		}
		port1.on('message', waitForPort);
	});

	// console.log('register worker');
	module.register(import.meta.resolve('./hook-worker.js'), {
		data: { options, tsFile, port: port2 },
		transferList: [port2],
	});

	// console.log('watting for worker to be ready');
	await ready;
	port1.unref();
	// console.log('worker is ready!');

	process.argv[1] = tsFile;
	// console.log(found_index);
	return await import(tsFile);
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
	const systemDisabled =
		process.execArgv.some((e) => e.startsWith('--inspect')) || process.execArgv.includes('--enable-source-maps');

	if (!userDisabled && !systemDisabled) {
		// console.log('register source-map');
		const { install } = await import('source-map-support');
		install({
			retrieveSourceMap(source) {
				const map = sourceMaps.get(source);
				if (map) {
					console.log(`matched source map for: ${source}`);
					return { url: source.replace(schema, ''), map: map };
				}
				console.warn(`need to resolve source map for: ${source}`);
				return null;
			},
		});
	} else {
		// console.log('not register source-map');
	}
}
