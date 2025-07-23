import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { createMonorepoObject } from './workspace.js';
import { startUi } from './user-interactive.js';

export async function runWatch() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject();

	startUi(repo);

	process.on('SIGPIPE', () => {
		process.stderr.write('\x1Bc');
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});
	repo.onStateChange(() => {
		process.stderr.write('\x1Bc');
		repo.printScreen();
	});

	await repo.startup();
	shutdown(1);
}
