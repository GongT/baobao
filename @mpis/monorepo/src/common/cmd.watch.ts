import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { createMonorepoObject } from './monorepo.js';
import { startUi } from './user-interactive.js';

export async function runWatch() {
	const repo = await createMonorepoObject();

	startUi(repo);

	process.on('SIGPIPE', () => {
		process.stderr.write('\x1Bc');
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});
	repo.onStateChange(() => {
		// process.stderr.write('\x1Bc');
		// printScreen();
	});

	await repo.startup();
	shutdown(1);
}
