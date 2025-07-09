import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { createMonorepoObject } from './monorepo.js';

export async function runBuild() {
	const repo = await createMonorepoObject();

	repo.onStateChange(() => {
		if (process.stderr.isTTY) process.stderr.write('\x1Bc');

		repo.printScreen();
	});
	try {
		await repo.startup();

		logger.success('Monorepo started successfully');
	} catch (error: any) {
		console.error(error.message);
		shutdown(1);
	}
}
