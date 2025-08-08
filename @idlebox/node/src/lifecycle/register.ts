/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import { AppExit, ensureDisposeGlobal, ensureGlobalObject, prettyPrintError, type MyCallback } from '@idlebox/common';
import assert from 'node:assert';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';
import { Exit, InterruptError, UncaughtException, UnhandledRejection } from './internal-errors.js';

const originalExit: (code?: number) => never = process.exit;
const prefix = process.stderr.isTTY ? '' : `<${title()} ${process.pid}> `;
const hasInspect = process.argv.some((arg) => arg.startsWith('--inspect=') || arg.startsWith('--inspect-brk=') || arg === '--inspect' || arg === '--inspect-brk');

let abnormalExitCode = 1;
export function setAbnormalExitCode(code: number) {
	if (code < 1) {
		throw new TypeError(`abnormal exit code must be greater than 0, got ${code}`);
	}
	abnormalExitCode = code;
}

function title() {
	if (process.title && process.title !== 'node') {
		return process.title;
	}
	return basename(process.argv[1] || '') || 'node';
}

function getCurrentCode() {
	return typeof process.exitCode === 'string' ? parseInt(process.exitCode) : process.exitCode || 0;
}

let shuttingDown = false;
export function shutdown(exitCode: number): never {
	if (hasInspect) debugger;

	if (exitCode) {
		process.exitCode = exitCode;
	}

	if (!shuttingDown) {
		shuttingDown = true;
		ensureDisposeGlobal().finally(() => {
			originalExit(getCurrentCode());
		});
	}

	throw new Exit(getCurrentCode());
}

const typed_error_handlers = new WeakMap<ErrorConstructor, MyCallback<[Error]>>();
const inherit_error_handlers = new Map<ErrorConstructor, MyCallback<[Error]>>();

type ErrorConstructor = new (...args: any[]) => Error;

export function registerNodejsGlobalTypedErrorHandlerWithInheritance(ErrorCls: ErrorConstructor, fn: MyCallback<[Error]>) {
	if (typed_error_handlers.has(ErrorCls)) {
		throw new ErrorCls(`conflict register of error type ${ErrorCls.name}`);
	}
	assert.notEqual(ErrorCls, Error, 'cannot register basic Error type');
	inherit_error_handlers.set(ErrorCls, fn);
}
export function registerNodejsGlobalTypedErrorHandler(ErrorCls: ErrorConstructor, fn: MyCallback<[Error]>) {
	if (typed_error_handlers.has(ErrorCls)) {
		throw new ErrorCls(`conflict register of error type ${ErrorCls.name}`);
	}
	assert.notEqual(ErrorCls, Error, 'cannot register basic Error type');
	typed_error_handlers.set(ErrorCls, fn);
}

function callErrorHandler(e: unknown) {
	if (!(e instanceof Error)) {
		prettyPrintError(`${prefix}catch unexpect object`, new Error(`error object is ${typeof e} ${e ? (e as any).constructor?.name : 'unknown'}`));
		throw originalExit(abnormalExitCode);
	}

	try {
		const catcher = typed_error_handlers.get(e.constructor as ErrorConstructor);
		if (catcher) {
			catcher(e);
			return;
		}
		for (const [Cls, fn] of inherit_error_handlers) {
			if (e instanceof Cls) {
				fn(e);
				return;
			}
		}
	} catch (ee: any) {
		prettyPrintError(`${prefix}error while handle error`, {
			message: ee.message,
			stack: ee.stack,
			cause: e,
		});
		return;
	}

	if (e instanceof InterruptError) {
		if (shuttingDown) {
			console.error(`${prefix}Exiting immediately.`);
			originalExit(1);
		}

		shutdown(0);
	}
	if (e instanceof AppExit) {
		ensureDisposeGlobal().finally(() => {
			originalExit(getCurrentCode());
		});
	}
	if (e instanceof UncaughtException) {
		if (e.cause instanceof Error) {
			prettyPrintError(`${prefix}Unhandled Rejection`, e.cause);
		} else {
			console.error(`${prefix}Unhandled Rejection / error type unknown:`, e.cause);
		}
		shutdown(abnormalExitCode);
	}
	if (e instanceof UncaughtException) {
		prettyPrintError(`${prefix}Uncaught Exception`, e.cause);
		shutdown(abnormalExitCode);
	}
}

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler() {
	ensureGlobalObject('exithandler/register', _real_register);
}
function _real_register() {
	process.on('SIGINT', () => {
		console.error(`\n${prefix}Received SIGINT. Exiting gracefully...`);
		callErrorHandler(new InterruptError('SIGINT'));
	});

	process.on('SIGTERM', () => {
		console.error(`${prefix}Received SIGTERM. Exiting gracefully...`);
		callErrorHandler(new InterruptError('SIGTERM'));
	});

	process.on('beforeExit', (code) => {
		// empty handler prevent real exit
		shutdown(code);
	});

	process.on('unhandledRejection', (reason, promise) => {
		if (reason instanceof AppExit) {
			return;
		}
		if (hasInspect) debugger;
		callErrorHandler(new UnhandledRejection(reason, promise));
	});

	const processMdl = createRequire(import.meta.url)('node:process');
	processMdl.exit = shutdown;
	syncBuiltinESMExports();

	function uncaughtException(error: Error): void {
		if (error instanceof AppExit) {
			return;
		}
		if (hasInspect) debugger;

		callErrorHandler(new UncaughtException(error));
	}

	if (process.hasUncaughtExceptionCaptureCallback()) {
		process.on('uncaughtException', uncaughtException);
		throw new Error(`${prefix} [uncaught exception capture] callback already registered by other module`);
	}
	process.setUncaughtExceptionCaptureCallback(uncaughtException);

	return true;
}

/**
 * @deprecated 仅用于测试
 */
export function die(message: string): never {
	debugger;
	console.error(`${prefix}DIE!`, message);
	shutdown(1);
}
