/** biome-ignore-all lint/suspicious/noDebugger: debug file */

import { AppExit, ensureDisposeGlobal, ensureGlobalObject, prettyPrintError } from '@idlebox/common';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import process from 'node:process';

const originalExit = process.exit;
const prefix = process.stderr.isTTY ? '' : `<${title()} ${process.pid}> `;
const hasInspect = process.argv.some((arg) => arg.startsWith('--inspect=') || arg.startsWith('--inspect-brk=') || arg === '--inspect' || arg === '--inspect-brk');

function title() {
	if (process.title && process.title !== 'node') {
		return process.title;
	}
	return basename(process.argv[1] || '') || 'node';
}

class Exit extends AppExit {
	constructor(code: number) {
		super(`process exit with code ${code}`, code);
	}
}

const shuttingDown = false;
export function shutdown(exitCode: number): never {
	if (hasInspect) debugger;

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

/**
 * 注册nodejs退出处理器
 */
export function registerNodejsExitHandler() {
	ensureGlobalObject('exithandler/register', _real_register);
}
function _real_register() {
	process.on('SIGINT', () => {
		console.error(`\n${prefix}Received SIGINT. Exiting gracefully...`);

		if (shuttingDown) {
			console.error(`Exiting immediately.`);
			originalExit(1);
		}

		shutdown(0);
	});

	process.on('SIGTERM', () => {
		console.error(`${prefix}Received SIGTERM. Exiting gracefully...`);
		shutdown(0);
	});

	process.on('beforeExit', (code) => {
		console.error(`${prefix}Process beforeExit with code: ${code}`);
		shutdown(code);
	});

	process.on('unhandledRejection', (reason, _promise) => {
		if (hasInspect) debugger;

		if (reason instanceof Error) {
			if (reason instanceof AppExit) {
				return;
			}
			prettyPrintError(`${prefix}Unhandled Rejection`, reason);
		} else {
			console.error(`${prefix}Unhandled Rejection / error type unknown:`, reason);
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

		if (hasInspect) debugger;

		prettyPrintError(`${prefix}Uncaught Exception`, error);
		shutdown(1);
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
