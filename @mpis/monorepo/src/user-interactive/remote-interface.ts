import { logger } from '@idlebox/logger';
import { terminal } from '@idlebox/terminal-control/default';
import { debugMode } from '../common/args.js';
import type { IPnpmMonoRepo } from '../common/workspace.js';

export function startRemoteInterface(repo: IPnpmMonoRepo) {
	const term = process.stderr.isTTY && !debugMode;
	process.on('SIGPIPE', () => {
		if (term) {
			terminal.erase.all(true);
		}
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});
}
