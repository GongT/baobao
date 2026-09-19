import { registerGlobalLifecycle, type IDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { isShuttingDown } from '@idlebox/node';
import { terminal } from '@idlebox/terminal-control/default';
import { debugMode } from '../common/args.js';
import type { IPnpmMonoRepo } from '../common/workspace.js';
import { setTitle, type IUserControl } from './terminal-interface.js';

export function createWatchStatePrinter(repo: IPnpmMonoRepo, controller: IUserControl) {
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

export function createBuildStatePrinter(repo: IPnpmMonoRepo) {
	const d = repo.onStateChange(() => {
		if (isShuttingDown()) return;
		if (process.stderr.isTTY) {
			terminal.erase.all(true);
			terminal.progress.update(repo.getProgress());
		}
		repo.printScreen();
	});

	let dis = false;
	const r: IDisposable = {
		dispose() {
			if (!dis) {
				dis = true;
				d.dispose();
				terminal.progress.clear();
			}
		},
	};
	registerGlobalLifecycle(r);
	return r;
}
