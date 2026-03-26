import inspector from 'node:inspector';
import { inspect } from 'node:util';
import type { MessagePort } from 'node:worker_threads';
import { enables } from '../common/env.js';
import { DebugMessageKind, type IDebugMessage } from '../common/message.types.js';
import { inspectEnabled } from './env.js';

let log_port: MessagePort;

export function registerLogger(port: MessagePort) {
	log_port = port;
}

function post(message: IDebugMessage) {
	log_port.postMessage(message);
}

type TemplateFunction = (message: readonly string[], ...args: any[]) => void;
export type ILogger = Record<DebugMessageKind, TemplateFunction>;
type IBufferLogger = ILogger & { flush(): void };

function create_one(kind: DebugMessageKind): TemplateFunction {
	return (message: readonly string[], ...args: any[]) => {
		if (!enables[kind]) {
			return;
		}
		post({ type: 'outputs', message: template(message, args), kind } satisfies IDebugMessage);
	};
}

export const logger: ILogger & { buffer(): IBufferLogger } = {
	[DebugMessageKind.worker]: create_one(DebugMessageKind.worker),
	[DebugMessageKind.import]: create_one(DebugMessageKind.import),
	[DebugMessageKind.esbuild]: create_one(DebugMessageKind.esbuild),
	[DebugMessageKind.resolve]: create_one(DebugMessageKind.resolve),
	[DebugMessageKind.output]: create_one(DebugMessageKind.output),
	[DebugMessageKind.error]: create_one(DebugMessageKind.error),
	buffer: buffer,
};

function inspect_output(tag: string, message: readonly string[], ...args: any[]) {
	inspector.console.log(`[%s] %s`, tag, template(message, args));
}

if (inspectEnabled) {
	// 调试器存在时，不管 DEBUG 是什么，都向调试器输出
	for (const kind of Object.values(DebugMessageKind) as DebugMessageKind[]) {
		const original = logger[kind];

		Object.assign(logger, {
			[kind](message: readonly string[], ...args: any[]) {
				original(message, ...args);
				inspect_output(kind, message, ...args);
			},
		});
	}
}

function template(strings: readonly string[], args: any[]) {
	let ret = '';
	for (const part of strings) {
		ret += part;
		if (args.length > 0) {
			ret += stringify(args.shift());
		}
	}
	return ret;
}

function stringify(arg: any): string {
	if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
		return arg.toString().trim();
	}
	if (arg === null || arg === undefined) {
		return `${arg}`;
	}
	if (Array.isArray(arg) && typeof arg[0] === 'string') {
		let r = '\n';
		for (const item of arg) {
			r += `  - ${item}\n`;
		}
		return r.trimEnd();
	}

	return inspect(arg, { colors: true, depth: 3, maxArrayLength: 2, compact: true, maxStringLength: 30 }).trim();
}

function buffer(): IBufferLogger {
	type Buffer = Array<[DebugMessageKind, readonly string[], any[]]>;
	const buffer: Buffer = [];

	const r: IBufferLogger = {
		[DebugMessageKind.worker]: create_buffer(DebugMessageKind.worker),
		[DebugMessageKind.import]: create_buffer(DebugMessageKind.import),
		[DebugMessageKind.esbuild]: create_buffer(DebugMessageKind.esbuild),
		[DebugMessageKind.resolve]: create_buffer(DebugMessageKind.resolve),
		[DebugMessageKind.output]: create_buffer(DebugMessageKind.output),
		[DebugMessageKind.error]: create_buffer(DebugMessageKind.error),
		flush() {
			for (const [method, strings, args] of buffer) {
				logger[method](strings, ...args);
			}
		},
	};
	Object.defineProperty(r, '_buffer', {
		value: buffer,
		enumerable: false,
	});
	return r;

	function create_buffer(method: DebugMessageKind): TemplateFunction {
		if (!enables[method]) return () => {};
		return (message: readonly string[], ...args: any[]) => {
			buffer.push([method, message, args]);
		};
	}
}
