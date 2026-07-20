/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import {
	convertCaughtError,
	createSymbol,
	dumpDisposableStack,
	ensureGlobalObject,
	globalSingletonStrong,
	isProductionMode,
	objectName,
	prettyPrintError,
} from '@idlebox/common';
import { ErrorWithCode, Exit, ExitCode, InterruptError, isNodeError, ProxiedError, UncaughtException, UnhandledRejection, UsageError } from '@idlebox/errors';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';
import { getCodehandler, getHandlerOnError } from './custom-error-handlers.js';
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
	return typeof (e as any)?.code === 'number';
}

function dumpGlobalDispose() {
	try {
		const global_life_cycle = createSymbol('lifecycle', 'application');
		const globalLifecycle = globalSingletonStrong(global_life_cycle);

		if (globalLifecycle) dumpDisposableStack(globalLifecycle as any);
	} catch (e) {
		prettyPrintError('导出全局生命周期对象时异常', convertCaughtError(e));
	}
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
			e = new Error(`错误对象类型不是Error: ${typeof effectiveError} ${effectiveError ? (effectiveError as any).constructor?.name : 'unknown'}`);
		}
		prettyPrintError(`${prefix}全局异常处理器捕获到非预期对象`, e);
		throw shutdown_immediate(exitCode);
	}

	if (effectiveError instanceof Exit) {
		/**
		 * Exit或者继承自Exit的错误被抛出
		 * 说明是预期中的退出流程，直接退出，不进行任何处理
		 */
		if (!isProductionMode) logger.verbose?.(`  - 跳过处理Exit错误`);
		if (!isShuttingDown()) _shutdown_graceful(effectiveError.code);
		throw effectiveError;
	}

	try {
		const catcher = getHandlerOnError(effectiveError);
		if (catcher) {
			if (!isProductionMode) logger.verbose?.(`  - 调用类型捕获函数 "${objectName(catcher) || '*匿名*'}" 处理错误 "${effectiveError.message}"`);
			catcher(effectiveError);
			return;
		}
		if (isNodeError(effectiveError)) {
			const catcher = getCodehandler(effectiveError);
			if (catcher) {
				if (!isProductionMode) logger.verbose?.(`  - 调用错误码捕获函数 "${objectName(catcher) || '*匿名*'}" 处理错误代码 "${effectiveError.code}"`);
				catcher(effectiveError);
				return;
			}
		}
		if (effectiveError instanceof UsageError) {
			logger.log(`\n${prefix}用法错误: ${effectiveError.message}\n`);
			return;
		}
	} catch (ee: any) {
		if (ee instanceof Exit) return;
		prettyPrintError(`${prefix}处理错误时发生异常`, {
			message: ee.message,
			stack: ee.stack,
			cause: effectiveError,
		});
		logger.log(`${prefix}由于遇到无法处理的错误，程序寄了`);
		shutdown_immediate(ExitCode.PROGRAM);
	}

	if (effectiveError instanceof InterruptError) {
		if (!isProductionMode) logger.verbose?.(`  - shuttingDown = ${shuttingDownCounter}`);

		const signal = effectiveError.signal;
		if (signal === 'SIGINT') {
			process.stderr.write(shuttingDownCounter === 0 ? '\n' : '\r');
		}
		if (shuttingDownCounter > 4) {
			logger.log(`${prefix}收到信号 ${signal} 超过5次! 立即退出`);
			dumpGlobalDispose();
			shutdown_immediate(ExitCode.INTERRUPT);
		} else if (shuttingDownCounter > 0) {
			logger.log(`${prefix}收到信号 ${signal} 第 ${shuttingDownCounter + 1} 次`);
			dumpGlobalDispose();
		} else {
			logger.log(`${prefix}收到信号 ${signal}. 正在优雅退出`);
		}
		shutdown(ExitCode.INTERRUPT);
	}

	const addonTitle = prefix ? `| ${prefix.trim()}` : '';

	if (caughtError instanceof UnhandledRejection) {
		if (!isProductionMode) logger.verbose?.(`  - UnhandledRejection`);
		prettyPrintError(`未处理的Promise拒绝${addonTitle}`, effectiveError);
		return;
	}
	if (caughtError instanceof UncaughtException) {
		if (!isProductionMode) logger.verbose?.(`  - UncaughtException`);
		prettyPrintError(`未捕获的异常${addonTitle}`, effectiveError);
		return;
	}

	if (!isProductionMode) logger.verbose?.(`  - 普通异常`);
	prettyPrintError(`未处理的异常${addonTitle}`, effectiveError);
	shutdown(ExitCode.PROGRAM);
}

interface IDebugOutput {
	log(message: string): void;
	verbose?(message: string): void;
}

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler(_logger: IDebugOutput = { log: console.error }) {
	logger = _logger;
	ensureGlobalObject('exithandler/register', () => _real_register());
}

function _real_register() {
	if (!isProductionMode) logger.verbose?.(`注册nodejs退出处理器: production=${isProductionMode}`);

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
			logger.log(`${prefix}收到beforeExit事件，但 process.exitCode 尚未设置，设为默认值"${code}""`);
		}
		_shutdown_graceful(code);
	});

	if (process.hasUncaughtExceptionCaptureCallback()) {
		process.on('uncaughtException', uncaughtExceptionHandle);
		throw new Error(
			`${prefix} [uncaught exception capture] 其他地方注册了全局异常捕获回调，这会导致本模块无法正常工作，请检查代码中是否有 process.setUncaughtExceptionCaptureCallback()`,
		);
	}
	process.setUncaughtExceptionCaptureCallback(uncaughtExceptionHandle);

	if (process.listenerCount('uncaughtException') > 0) {
		logger.log(`${prefix}警告: 已经注册了${process.listenerCount('uncaughtException')}个uncaughtException处理器，它们可能不会再被调用到`);
	}
	const originalOn = process.on;
	process.on = (event: string, listener: any) => {
		if (event === 'uncaughtException') {
			logger.log(`${prefix}警告: 尝试注册一个uncaughtException处理器，全局处理器已被替换，此注册行为无效`);
		}
		return originalOn.call(process, event, listener);
	};

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
				if (!isProductionMode) logger.verbose?.(`全局异常处理: 收到错误码: ${e.cause.code}`);
				_shutdown_graceful(e.cause.code);
			} else {
				if (!isProductionMode) logger.verbose?.(`全局异常处理: 无码错误: ${e.cause} `);
				_shutdown_graceful(ExitCode.PROGRAM);
			}
		} catch (ee: any) {
			if (ee instanceof Exit) {
				return;
			}
			prettyPrintError('处理异常时发生异常', ee);
			shutdown_immediate(ExitCode.PROGRAM);
		}
	}
}

/**
 * @deprecated 仅用于测试
 */
export function die(message: string): never {
	debugger;
	console.error(`${prefix}调试中主动寄了!`, message);
	shutdown_immediate(1);
}
