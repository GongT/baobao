/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import { ensureDisposeGlobal, ensureGlobalObject, functionName, isProductionMode, prettyPrintError, type MyCallback } from '@idlebox/common';
import { ErrorWithCode, Exit, ExitCode, InterruptError, UncaughtException, UnhandledRejection } from '@idlebox/errors';
import assert from 'node:assert';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';
import { inspect } from 'node:util';

const originalExit: (code?: number) => never = process.exit;
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
	_shutdown(exitCode);
	throw new Exit(getCurrentCode());
}
function _shutdown(exitCode: number) {
	setExitCodeIfNot(exitCode);

	if (!shuttingDown) {
		shuttingDown = 1;
		ensureDisposeGlobal().finally(() => {
			originalExit(getCurrentCode());
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

function uniqueErrorHandler(e: unknown, logger: IDebugOutput) {
	if (!isProductionMode) logger.verbose?.(`uniqueErrorHandler:`);
	if (!(e instanceof Error)) {
		prettyPrintError(`${prefix}catch unexpect object`, new Error(`error object is ${typeof e} ${e ? (e as any).constructor?.name : 'unknown'}`));
		throw originalExit(ExitCode.PROGRAM);
	}

	if (e instanceof Exit) {
		if (!isProductionMode) logger.verbose?.(`  - skip exit object`);
		if (!shuttingDown) {
			_shutdown(e.code);
		}
		throw e;
	}

	try {
		const catcher = typed_error_handlers.get(e.constructor as ErrorConstructor);
		if (catcher) {
			if (!isProductionMode) logger.verbose?.(`  - call catcher ${functionName(catcher)}`);
			catcher(e);
			return;
		}
		for (const [Cls, fn] of inherit_error_handlers) {
			if (!isProductionMode) logger.verbose?.(`  - call inherited catcher ${functionName(fn)}`);
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
		if (!isProductionMode) logger.verbose?.(`  - shuttingDown = ${shuttingDown}`);
		if (shuttingDown > 5) {
			logger.output(`${prefix}Exiting immediately.`);
			originalExit(ExitCode.INTERRUPT);
		}

		shutdown(ExitCode.INTERRUPT);
	}
	if (e instanceof UnhandledRejection) {
		if (!isProductionMode) logger.verbose?.(`  - UnhandledRejection`);
		if (e.cause instanceof Error) {
			prettyPrintError(`${prefix}Unhandled Rejection`, e.cause);
		} else {
			logger.output(`${prefix}Unhandled Rejection / error type unknown: ${inspect(e.cause)}`);
		}
		return;
	}
	if (e instanceof UncaughtException) {
		if (!isProductionMode) logger.verbose?.(`  - UncaughtException`);
		prettyPrintError(`${prefix}Uncaught Exception`, e.cause);
		return;
	}

	if (!isProductionMode) logger.verbose?.(`  - common error`);
	prettyPrintError(`${prefix}unhandled global exception`, e);
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
	process.on('SIGINT', () => {
		logger.output(`\n${prefix}Received SIGINT. Exiting gracefully...`);
		uniqueErrorHandler(new InterruptError('SIGINT'), logger);
	});

	process.on('SIGTERM', () => {
		logger.output(`${prefix}Received SIGTERM. Exiting gracefully...`);
		uniqueErrorHandler(new InterruptError('SIGTERM'), logger);
	});

	process.on('beforeExit', (code) => {
		// empty handler prevent real exit
		if (!isProductionMode) logger.verbose?.(`process: beforeExit: ${code}`);
		if (process.exitCode === undefined || process.exitCode === '') {
			code = ExitCode.EXECUTION;
			logger.output(`${prefix}beforeExit called, but process.exitCode has not been set, switch to ${code}`);
		}
		_shutdown(code);
	});

	function finalThrow(e: UnhandledRejection | UncaughtException) {
		try {
			uniqueErrorHandler(e, logger);

			if (e.cause instanceof ErrorWithCode) {
				if (!isProductionMode) logger.verbose?.(`finalThrow: got code: ${e.cause.code}`);
				_shutdown(e.cause.code);
			} else {
				if (!isProductionMode) logger.verbose?.(`finalThrow: not got code: ${e.cause} `);
				_shutdown(ExitCode.PROGRAM);
			}
		} catch (e: any) {
			if (e instanceof Exit) {
				return;
			}
			prettyPrintError('Exception while handling error', e);
			_shutdown(ExitCode.PROGRAM);
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
