import { AppExit, ensureDisposeGlobal, globalSingletonStrong, prettyPrintError } from '@idlebox/common';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import process from 'node:process';

const originalExit = process.exit;

class Exit extends AppExit {
	constructor(code: number) {
		super(`process exit with code ${code}`, code);
	}
}

const shuttingDown = false;
export function shutdown(exitCode: number): never {
	debugger;

	if (exitCode) {
		process.exitCode = exitCode;
	}
	const code = typeof process.exitCode === 'string' ? parseInt(process.exitCode) : process.exitCode || 0;

	if (shuttingDown) {
		throw new Exit(code);
	}

	ensureDisposeGlobal().finally(() => {
		originalExit(process.exitCode);
	});

	throw new Exit(code);
}

const exitHandler = Symbol('exithandler/registed');

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler() {
	globalSingletonStrong(exitHandler, _real_register);
}
function _real_register() {
	process.on('SIGINT', () => {
		console.log('\nReceived SIGINT. Exiting gracefully...');

		if (shuttingDown) {
			console.error('Exiting immediately.');
			originalExit(1);
		}

		shutdown(0);
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM. Exiting gracefully...');
		shutdown(0);
	});

	process.on('beforeExit', (code) => {
		console.log(`Process beforeExit with code: ${code}`);
		shutdown(code);
	});

	process.on('unhandledRejection', (reason, _promise) => {
		if (reason instanceof Error) {
			if (reason instanceof AppExit) {
				return;
			}
			prettyPrintError('Unhandled Rejection', reason);
		} else {
			console.error('Unhandled Rejection / error type unknown:', reason);
		}
		shutdown(1);
	});

	const processMdl = createRequire(import.meta.url)('node:process');
	processMdl.exit = shutdown;
	syncBuiltinESMExports();

	function uncaughtException(error: Error): void {
		if (error instanceof AppExit) {
			return;
		}
		prettyPrintError('Uncaught Exception', error);
		shutdown(1);
	}

	if (process.hasUncaughtExceptionCaptureCallback()) {
		process.on('uncaughtException', uncaughtException);
		throw new Error('[process uncaught exception capture] callback already registered by other module');
	}
	process.setUncaughtExceptionCaptureCallback(uncaughtException);

	return true;
}

/**
 * @deprecated 仅用于测试
 */
export function die(message: string): never {
	console.error(message);
	shutdown(1);
}
