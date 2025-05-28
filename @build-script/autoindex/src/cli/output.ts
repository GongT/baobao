import { ensureDisposeGlobal, prettyPrintError } from '@idlebox/common';

export function die(message: string): never {
	console.error(`💥💥💥 ${message}`);

	Promise.resolve(ensureDisposeGlobal).finally(() => {
		process.exit(process.exitCode || 1);
	});

	process.on('uncaughtException', (reason) => {
		if (reason instanceof ExitError) {
			// ignore
			return;
		}
		prettyPrintError('Uncaught Exception:', reason);
		process.exit(1);
	});

	throw new ExitError('process.exit() will never return');
}

class ExitError extends Error {}
