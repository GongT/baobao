import { ensureDisposeGlobal } from '@idlebox/common';

export let isApplicationShuttingDown = false;

export function shutdown(code: number) {
	if (isApplicationShuttingDown) {
		process.exitCode = code || process.exitCode;
		return;
	}
	isApplicationShuttingDown = true;
	ensureDisposeGlobal().finally(() => {
		process.exit(code || process.exitCode);
	});
}

export let shutdownExtraErase = 0;

export function registerShutdownHandlers() {
	process.on('unhandledRejection', (reason, promise) => {
		console.error('got unhandledRejection: %s', reason);
		console.error(promise);
		shutdown(1);
	});

	process.on('SIGINT', () => {
		console.error('\ngot SIGINT');
		shutdownExtraErase += 2;
		shutdown(0);
	});

	process.on('SIGTERM', () => {
		console.error('\ngot SIGTERM');
		shutdownExtraErase += 2;
		shutdown(0);
	});

	process.on('beforeExit', (code) => {
		shutdown(code);
	});
}
