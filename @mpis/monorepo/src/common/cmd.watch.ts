import { argv } from '@idlebox/args/default';
import { InterruptError, prettyPrintError, registerGlobalLifecycle, type IDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsGlobalTypedErrorHandlerWithInheritance, shutdown } from '@idlebox/node';
import { debugMode } from './args.js';
import { startUi } from './user-interactive.js';
import { createMonorepoObject } from './workspace.js';

export async function runWatch() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	let statePrinterDisposable: IDisposable;
	const repo = await createMonorepoObject();
	const cls = process.stderr.isTTY && !debugMode;

	registerGlobalLifecycle(repo);

	startUi(repo);

	registerNodejsGlobalTypedErrorHandlerWithInheritance(InterruptError, () => {
		console.error(' -- Interrupted.');
		statePrinterDisposable?.dispose();
		shutdown(0);
	});

	process.on('SIGPIPE', () => {
		if (cls) process.stderr.write('\x1Bc');
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});

	if (!debugMode) {
		statePrinterDisposable = repo.onStateChange(() => {
			if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
			logger.info`State changed, printing current state...`;
			repo.printScreen(true);
		});
	}

	try {
		await repo.startup();
	} catch (e: any) {
		if (debugMode) {
			if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
			repo.printScreen();
		}
		prettyPrintError('监视模式下有进程退出', e);
		shutdown(1);
	}

	if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
	repo.printScreen();

	// logger.fatal`watch mode exited`;
}
