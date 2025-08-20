/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import { ensureDisposeGlobal, ensureGlobalObject, functionName, isProductionMode, prettyPrintError, type MyCallback } from '@idlebox/common';
import { ErrorWithCode, Exit, ExitCode, InterruptError, UncaughtException, UnhandledRejection } from '@idlebox/errors';
import assert from 'node:assert';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';
import { inspect } from 'node:util';

const shutdown_immediate: (code?: number) => never = process.exit;
const prefix = process.stderr.isTTY ? '' : `<${title()} ${process.pid}> `;

function title() {
	if (process.title && process.title !== 'node') {
		return process.title;
	}
	return basename(process.argv[1] || '') || 'node';
}

function getCurrentCode() {
	return typeof process.exitCode === 'string' ? parseInt(process.exitCode) : process.exitCode || 0;
}

export function setExitCodeIfNot(exitCode: number) {
	if (exitCode || typeof process.exitCode !== 'number') {
		process.exitCode = exitCode;
		globalThis.process.exitCode = exitCode;
	}
}

let shuttingDown = 0;
export function shutdown(exitCode: number): never {
	_shutdown_graceful(exitCode);
	throw new Exit(getCurrentCode());
}
export function isShuttingDown() {
	return shuttingDown > 0;
}
function _shutdown_graceful(exitCode: number) {
	setExitCodeIfNot(exitCode);

	if (!shuttingDown) {
		shuttingDown = 1;
		ensureDisposeGlobal().finally(() => {
			shutdown_immediate(getCurrentCode());
		});
	} else {
		shuttingDown++;
	}
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

function _root_cause(e: Error) {
	if (e.cause instanceof Error) {
		return _root_cause(e.cause);
	}
	return e;
}

function uniqueErrorHandler(currentError: unknown, logger: IDebugOutput) {
	if (!isProductionMode) logger.verbose?.(`uniqueErrorHandler:`);
	if (!(currentError instanceof Error)) {
		prettyPrintError(
			`${prefix}catch unexpect object`,
			new Error(`error object is ${typeof currentError} ${currentError ? (currentError as any).constructor?.name : 'unknown'}`),
		);
		throw shutdown_immediate(ExitCode.PROGRAM);
	}

	const rootCause = _root_cause(currentError);
	if (rootCause instanceof Exit) {
		if (!isProductionMode) logger.verbose?.(`  - skip exit object`);
		if (!shuttingDown) _shutdown_graceful(rootCause.code);
		throw rootCause;
	}

	try {
		const catcher = typed_error_handlers.get(rootCause.constructor as ErrorConstructor);
		if (catcher) {
			if (!isProductionMode) logger.verbose?.(`  - call catcher ${functionName(catcher)}`);
			catcher(rootCause);
			return;
		}
		for (const [Cls, fn] of inherit_error_handlers) {
			if (!isProductionMode) logger.verbose?.(`  - call inherited catcher ${functionName(fn)}`);
			if (rootCause instanceof Cls) {
				fn(rootCause);
				return;
			}
		}
	} catch (ee: any) {
		if (ee instanceof Exit) return;
		prettyPrintError(`${prefix}error while handle error`, {
			message: ee.message,
			stack: ee.stack,
			cause: rootCause,
		});
		return;
	}

	if (rootCause instanceof InterruptError) {
		if (!isProductionMode) logger.verbose?.(`  - shuttingDown = ${shuttingDown}`);

		const signal = rootCause.signal;
		if (signal === 'SIGINT') {
			process.stderr.write(shuttingDown === 0 ? '\n' : '\r');
		}
		if (shuttingDown > 4) {
			logger.output(`${prefix}Received ${signal} more than 5 times. Exiting immediately.`);
			shutdown_immediate(ExitCode.INTERRUPT);
		} else if (shuttingDown > 0) {
			logger.output(`${prefix}Received ${signal} ${shuttingDown + 1} times.`);
		} else {
			logger.output(`${prefix}Received ${signal}. Exiting gracefully...`);
		}
		shutdown(ExitCode.INTERRUPT);
	}
	if (currentError instanceof UnhandledRejection) {
		if (!isProductionMode) logger.verbose?.(`  - UnhandledRejection`);
		if (rootCause !== currentError) {
			prettyPrintError(`${prefix}Unhandled Rejection`, currentError.cause);
		} else {
			logger.output(`${prefix}Unhandled Rejection / error type unknown: ${inspect(currentError.cause)}`);
		}
		return;
	}
	if (currentError instanceof UncaughtException) {
		if (!isProductionMode) logger.verbose?.(`  - UncaughtException`);
		prettyPrintError(`${prefix}Uncaught Exception`, rootCause);
		return;
	}

	if (!isProductionMode) logger.verbose?.(`  - common error`);
	prettyPrintError(`${prefix}unhandled global exception`, currentError);
	shutdown(ExitCode.PROGRAM);
}

interface IDebugOutput {
	output(message: string): void;
	verbose?(message: string): void;
}

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler(logger: IDebugOutput = { output: console.error }) {
	ensureGlobalObject('exithandler/register', () => _real_register(logger));
}
function _real_register(logger: IDebugOutput) {
	logger.verbose?.(`register nodejs exit handler: production=${isProductionMode}`);

	process.on('SIGINT', () => signal_handler('SIGINT'));
	process.on('SIGTERM', () => signal_handler('SIGTERM'));

	function signal_handler(signal: 'SIGINT' | 'SIGTERM') {
		setImmediate(() => {
			uniqueErrorHandler(new InterruptError(signal, signal_handler), logger);
		});
	}

	process.on('beforeExit', (code) => {
		// empty handler prevent real exit
		if (!isProductionMode) logger.verbose?.(`process: beforeExit: ${code}`);
		if (process.exitCode === undefined || process.exitCode === '') {
			code = ExitCode.EXECUTION;
			logger.output(`${prefix}beforeExit called, but process.exitCode has not been set, switch to ${code}`);
		}
		_shutdown_graceful(code);
	});

	function finalThrow(e: UnhandledRejection | UncaughtException) {
		try {
			uniqueErrorHandler(e, logger);

			if (e.cause instanceof ErrorWithCode) {
				if (!isProductionMode) logger.verbose?.(`finalThrow: got code: ${e.cause.code}`);
				_shutdown_graceful(e.cause.code);
			} else {
				if (!isProductionMode) logger.verbose?.(`finalThrow: not got code: ${e.cause} `);
				_shutdown_graceful(ExitCode.PROGRAM);
			}
		} catch (ee: any) {
			if (ee instanceof Exit) {
				return;
			}
			prettyPrintError('Exception while handling error', ee);
			shutdown_immediate(ExitCode.PROGRAM);
		}
	}

	process.on('unhandledRejection', (reason, promise) => {
		finalThrow(new UnhandledRejection(reason, promise));
	});

	function uncaughtException(error: Error): void {
		finalThrow(new UncaughtException(error));
	}

	if (process.hasUncaughtExceptionCaptureCallback()) {
		process.on('uncaughtException', uncaughtException);
		throw new Error(`${prefix} [uncaught exception capture] callback already registered by other module`);
	}
	process.setUncaughtExceptionCaptureCallback(uncaughtException);

	process.exit = shutdown;
	syncBuiltinESMExports();

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
