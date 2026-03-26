import { ensureDisposeGlobal } from '@idlebox/common';
import { Exit } from '@idlebox/errors';
import process from 'node:process';

/** @internal */
export const shutdown_immediate: (code?: number) => never = process.exit;

function getCurrentCode() {
	return typeof process.exitCode === 'string' ? parseInt(process.exitCode, 10) : process.exitCode || 0;
}

/**
 * 如果没有退出码或者为0，则设为 exitCode
 * 如果yie为非0，则不修改
 */
export function setExitCodeIfNot(exitCode: number) {
	if (!process.exitCode) {
		process.exitCode = exitCode;
		globalThis.process.exitCode = exitCode;
	}
}

/** @internal */
export let shuttingDownCounter = 0;
export function shutdown(exitCode: number): never {
	_shutdown_graceful(exitCode);
	throw new Exit(getCurrentCode());
}
export function isShuttingDown() {
	return shuttingDownCounter > 0;
}

/** @internal */
export function _shutdown_graceful(exitCode: number) {
	setExitCodeIfNot(exitCode);

	if (!shuttingDownCounter) {
		shuttingDownCounter = 1;
		ensureDisposeGlobal().finally(() => {
			shutdown_immediate(getCurrentCode());
		});
	} else {
		shuttingDownCounter++;
	}
}
