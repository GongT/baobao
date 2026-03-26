import { logger } from '@idlebox/logger';
import { terminal } from '@idlebox/terminal-control/default';
import { debugMode } from '../common/args.js';
import type { IPnpmMonoRepo } from '../common/workspace.js';
import { setTitle, type IUserControl } from './terminal-interface.js';

export function createStatePrinter(repo: IPnpmMonoRepo, controller: IUserControl) {
	if (debugMode) return undefined;
	const term = process.stderr.isTTY && !debugMode;

	return repo.onStateChange(() => {
		if (controller.pause) return;

		if (!repo.disposed && term) {
			terminal.reset();
			const p = repo.getProgress();
			if (repo.hasWorkerNotComplete()) {
				setTitle('⌛处理中');
				terminal.progress.update(p);
			} else {
				if (repo.hasWorkerFailed()) {
					terminal.progress.error(p);
					setTitle('❌监视');
				} else {
					terminal.progress.clear();
					setTitle('✅监视');
				}
			}
		}
		logger.info`State changed, printing current state...`;
		repo.printScreen(true);
	});
}
