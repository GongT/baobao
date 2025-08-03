import { inspect } from 'node:util';
import type { MessagePort } from 'node:worker_threads';
import { debugs } from './cli.js';
import type { IDebugMessage, IWarningMessage } from './message.types.js';

let log_port: MessagePort;

export function registerLogger(port: MessagePort) {
	log_port = port;
}

export const logger = {
	worker(message: readonly string[], ...args: any[]) {
		if (!debugs.worker.enabled) {
			return;
		}

		log_port.postMessage({ type: 'debug', message: template(message, args), kind: 'worker' } satisfies IDebugMessage);
	},
	hook(message: readonly string[], ...args: any[]) {
		if (!debugs.import.enabled) {
			return;
		}

		log_port.postMessage({ type: 'debug', message: template(message, args), kind: 'import' } satisfies IDebugMessage);
	},
	esbuild(message: readonly string[], ...args: any[]) {
		if (!debugs.esbuild.enabled) {
			return;
		}

		log_port.postMessage({ type: 'debug', message: template(message, args), kind: 'esbuild' } satisfies IDebugMessage);
	},
	error(message: readonly string[], ...args: any[]) {
		log_port.postMessage({ type: 'warning', message: template(message, args) } satisfies IWarningMessage);
	},
	output(message: readonly string[], ...args: any[]) {
		log_port.postMessage({ type: 'debug', message: template(message, args), kind: 'output' } satisfies IDebugMessage);
	},
	resolve(message: readonly string[], ...args: any[]) {
		if (!debugs.resolve.enabled) {
			return;
		}

		log_port.postMessage({
			type: 'debug',
			message: template(message, args),
			kind: 'resolve',
		} satisfies IDebugMessage);
	},
} as const;

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
		// biome-ignore lint/style/useTemplate: <explanation>
		return '' + arg;
	}
	if (Array.isArray(arg) && typeof arg[0] === 'string') {
		let r = '\n';
		for (const item of arg) {
			r += `  - ${item}\n`;
		}
		return r.trim();
	}

	return inspect(arg, { colors: true, depth: 3, maxArrayLength: 2, compact: true, maxStringLength: 30 }).trim();
}
