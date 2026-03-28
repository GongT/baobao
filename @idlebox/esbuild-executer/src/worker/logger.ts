import assert from 'node:assert';
import inspector from 'node:inspector';
import { inspect } from 'node:util';
import { isMainThread } from 'node:worker_threads';
import { enables } from '../common/env.js';
import { DebugMessageKind } from '../common/message.types.js';
import { inspectMode, postMessage } from './bridge.js';

assert.equal(isMainThread, false, '主线程不应该加载这个模块');

type TemplateFunction = (message: readonly string[], ...args: any[]) => void;
export type ILogger = Record<DebugMessageKind, TemplateFunction>;
type IBufferLogger = ILogger & { flush(): void };

function create_one(kind: DebugMessageKind): TemplateFunction {
	return (message: readonly string[], ...args: any[]) => {
		if (!enables[kind]) {
			return;
		}
		postMessage({ type: 'outputs', message: template(message, args), kind });
	};
}

export const logger: ILogger & { buffer(): IBufferLogger } = {
	[DebugMessageKind.worker]: create_one(DebugMessageKind.worker),
	[DebugMessageKind.hook]: create_one(DebugMessageKind.hook),
	[DebugMessageKind.verbose]: create_one(DebugMessageKind.verbose),
	[DebugMessageKind.esbuild]: create_one(DebugMessageKind.esbuild),
	[DebugMessageKind.resolve]: create_one(DebugMessageKind.resolve),
	[DebugMessageKind.output]: create_one(DebugMessageKind.output),
	[DebugMessageKind.error]: create_one(DebugMessageKind.error),
	buffer: buffer,
};

function inspect_output(tag: string, message: readonly string[], ...args: any[]) {
	inspector.console.log(`[%s] %s`, tag, template(message, args));
}

if (inspectMode) {
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
		[DebugMessageKind.hook]: create_buffer(DebugMessageKind.hook),
		[DebugMessageKind.esbuild]: create_buffer(DebugMessageKind.esbuild),
		[DebugMessageKind.resolve]: create_buffer(DebugMessageKind.resolve),
		[DebugMessageKind.output]: create_buffer(DebugMessageKind.output),
		[DebugMessageKind.error]: create_buffer(DebugMessageKind.error),
		[DebugMessageKind.verbose]: create_buffer(DebugMessageKind.verbose),
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
