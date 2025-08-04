import { argv } from '@idlebox/args/default';
import { prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { debugMode } from './args.js';
import { startUi } from './user-interactive.js';
import { createMonorepoObject } from './workspace.js';

export async function runWatch() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject();
	const cls = process.stderr.isTTY && !debugMode;

	registerGlobalLifecycle(repo);

	startUi(repo);

	process.on('SIGPIPE', () => {
		if (cls) process.stderr.write('\x1Bc');
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});

	if (!debugMode) {
		repo.onStateChange(() => {
			if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
			logger.info`State changed, printing current state...`;
			repo.printScreen();
		});
	}

	try {
		await repo.startup();
	} catch (e: any) {
		if (debugMode) {
			if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
			repo.printScreen();
		}
		prettyPrintError('watch mode error', e);
		shutdown(1);
	}

	if (cls && !repo.hasDisposed) process.stderr.write('\x1Bc');
	repo.printScreen();

	// logger.fatal`watch mode exited`;
}
