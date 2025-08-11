import { argv } from '@idlebox/args/default';
import { prettyPrintError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { debugMode } from './args.js';
import { createMonorepoObject } from './workspace.js';

export async function runBuild() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const hasCi = process.env.CI;
	const repo = await createMonorepoObject();

	if (!debugMode && !hasCi) {
		repo.onStateChange(() => {
			if (process.stderr.isTTY) process.stderr.write('\x1Bc');

			repo.printScreen();
		});
	}

	let completed = false;
	registerGlobalLifecycle(
		toDisposable(() => {
			if (debugMode || hasCi) {
				repo.printScreen();
			} else {
				if (process.stderr.isTTY) process.stderr.write('\x1Bc');
				repo.printScreen();
			}
			if (!completed && !process.exitCode) {
				process.exitCode = 1;
			}
		}),
	);

	try {
		await repo.startup();

		logger.success('Monorepo started successfully');
		completed = true;
	} catch (error: any) {
		prettyPrintError('monorepo build', error);
		shutdown(1);
	}
}
