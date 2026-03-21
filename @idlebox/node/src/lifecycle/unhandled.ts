/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import { ensureGlobalObject, getRootCause, isProductionMode, objectName, prettyPrintError } from '@idlebox/common';
import { ErrorWithCode, Exit, ExitCode, InterruptError, ProxiedError, UncaughtException, UnhandledRejection } from '@idlebox/errors';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';
import { inspect } from 'node:util';
import { getHandlerOnError } from './custom-error-handlers.js';
import { _shutdown_graceful, isShuttingDown, setExitCodeIfNot, shutdown, shutdown_immediate, shuttingDownCounter } from './process-shutdown.js';

const prefix = process.stderr.isTTY ? '' : `<${title()} ${process.pid}> `;
let logger!: IDebugOutput;

function title() {
	if (process.title && process.title !== 'node') {
		return process.title;
	}
	return basename(process.argv[1] || '') || 'node';
}

function hasCode(e: unknown): e is ErrorWithCode {
	return typeof e === 'object' && e !== null && 'code' in e;
}

/**
 * 全局最终错误处理器
 * 所有未捕获的异常、没有处理的rejection等等都会经过这里
 */
function uniqueErrorHandler(caughtError: unknown) {
	const effectiveError: unknown = caughtError instanceof ProxiedError ? caughtError.cause : caughtError;
	const exitCode = hasCode(effectiveError) ? effectiveError.code : ExitCode.PROGRAM;
	setExitCodeIfNot(exitCode);

	if (!isProductionMode) logger.verbose?.(`uniqueErrorHandler:`);
	if (effectiveError instanceof Error === false) {
		// 如果抛出的是非Error对象，即使是NotError
		// 不可能处理，立即退出程序
		let e: any;
		if (effectiveError && typeof effectiveError === 'object' && (effectiveError as any).message) {
			e = effectiveError;
		} else {
			e = new Error(`error object is ${typeof effectiveError} ${effectiveError ? (effectiveError as any).constructor?.name : 'unknown'}`);
		}
		prettyPrintError(`${prefix}全局异常处理器捕获到非预期对象`, e);
		throw shutdown_immediate(exitCode);
	}

	if (effectiveError instanceof Exit) {
		/**
		 * Exit或者继承自Exit的错误被抛出
		 * 说明是预期中的退出流程，直接退出，不进行任何处理
		 */
		if (!isProductionMode) logger.verbose?.(`  - skip exit object`);
		if (!isShuttingDown()) _shutdown_graceful(effectiveError.code);
		throw effectiveError;
	}

	try {
		const catcher = getHandlerOnError(effectiveError);
		if (catcher) {
			if (!isProductionMode) logger.verbose?.(`  - call catcher ${objectName(catcher)}`);
			catcher(effectiveError);
			return;
		}
	} catch (ee: any) {
		if (ee instanceof Exit) return;
		prettyPrintError(`${prefix}error while handle error`, {
			message: ee.message,
			stack: ee.stack,
			cause: effectiveError,
		});
		logger.output(`${prefix}died.`);
		shutdown_immediate(ExitCode.PROGRAM);
	}

	if (effectiveError instanceof InterruptError) {
		if (!isProductionMode) logger.verbose?.(`  - shuttingDown = ${shuttingDownCounter}`);

		const signal = effectiveError.signal;
		if (signal === 'SIGINT') {
			process.stderr.write(shuttingDownCounter === 0 ? '\n' : '\r');
		}
		if (shuttingDownCounter > 4) {
			logger.output(`${prefix}Received ${signal} more than 5 times. Exiting immediately.`);
			shutdown_immediate(ExitCode.INTERRUPT);
		} else if (shuttingDownCounter > 0) {
			logger.output(`${prefix}Received ${signal} ${shuttingDownCounter + 1} times.`);
		} else {
			logger.output(`${prefix}Received ${signal}. Exiting gracefully...`);
		}
		shutdown(ExitCode.INTERRUPT);
	}

	const rootCause = getRootCause(effectiveError);
	if (effectiveError instanceof UnhandledRejection) {
		if (!isProductionMode) logger.verbose?.(`  - UnhandledRejection`);
		if (rootCause !== effectiveError) {
			prettyPrintError(`${prefix}Unhandled Rejection`, effectiveError.cause);
		} else {
			logger.output(`${prefix}Unhandled Rejection / error type unknown: ${inspect(effectiveError.cause)}`);
		}
		return;
	}
	if (effectiveError instanceof UncaughtException) {
		if (!isProductionMode) logger.verbose?.(`  - UncaughtException`);
		if (rootCause !== effectiveError) {
			prettyPrintError(`${prefix}Unhandled Exception`, effectiveError.cause);
		} else {
			logger.output(`${prefix}Unhandled Exception / error type unknown: ${inspect(effectiveError.cause)}`);
		}
		return;
	}

	if (!isProductionMode) logger.verbose?.(`  - common error`);
	prettyPrintError(`${prefix}unhandled global exception`, effectiveError);
	shutdown(ExitCode.PROGRAM);
}

interface IDebugOutput {
	output(message: string): void;
	verbose?(message: string): void;
}

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler(_logger: IDebugOutput = { output: console.error }) {
	logger = _logger;
	ensureGlobalObject('exithandler/register', () => _real_register());
}

function _real_register() {
	if (!isProductionMode) logger.verbose?.(`register nodejs exit handler: production=${isProductionMode}`);

	process.on('SIGINT', () => signal_handler('SIGINT'));
	process.on('SIGTERM', () => signal_handler('SIGTERM'));

	function signal_handler(signal: 'SIGINT' | 'SIGTERM') {
		setImmediate(() => {
			uniqueErrorHandler(new InterruptError(signal, { boundary: signal_handler }));
		});
	}

	process.on('beforeExit', (code) => {
		if (!isProductionMode) logger.verbose?.(`process: beforeExit: ${code}`);
		if (process.exitCode === undefined || process.exitCode === '') {
			code = ExitCode.EXECUTION;
			logger.output(`${prefix}beforeExit called, but process.exitCode has not been set, switch to ${code}`);
		}
		_shutdown_graceful(code);
	});

	if (process.hasUncaughtExceptionCaptureCallback()) {
		process.on('uncaughtException', uncaughtExceptionHandle);
		throw new Error(`${prefix} [uncaught exception capture] callback already registered by other module`);
	}
	process.setUncaughtExceptionCaptureCallback(uncaughtExceptionHandle);

	process.on('unhandledRejection', (reason, promise) => {
		callHandler(new UnhandledRejection(reason, promise));
	});

	process.exit = shutdown;
	syncBuiltinESMExports();

	return true;

	function uncaughtExceptionHandle(error: Error): void {
		callHandler(new UncaughtException(error));
	}

	function callHandler(e: UnhandledRejection | UncaughtException) {
		if (!isProductionMode) logger.verbose?.(`callHandler: ${objectName(e)}`);
		try {
			uniqueErrorHandler(e);

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
}

/**
 * @deprecated 仅用于测试
 */
export function die(message: string): never {
	debugger;
	console.error(`${prefix}DIE!`, message);
	shutdown_immediate(1);
}
