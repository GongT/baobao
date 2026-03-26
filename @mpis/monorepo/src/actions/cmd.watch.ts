import { argv } from '@idlebox/args/default';
import { prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { terminal } from '@idlebox/terminal-control/default';
import { debugMode } from '../common/args.js';
import { createMonorepoObject } from '../common/workspace.js';
import { startRemoteInterface } from '../user-interactive/remote-interface.js';
import { setTitle, startUi } from '../user-interactive/terminal-interface.js';

export async function runWatch() {
	const debugChild = argv.flag('--child-verbose') > 0;

	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject({ debugChildren: debugChild });
	const term = process.stderr.isTTY && !debugMode;

	registerGlobalLifecycle(repo);
	startRemoteInterface(repo);

	const userControl = startUi(repo);

	try {
		if (term) setTitle('启动');
		await repo.startup();
	} catch (e: any) {
		if (debugMode && !userControl.pause) {
			if (!repo.disposed && term) {
				terminal.reset();
			}
			repo.printScreen();
		}
		prettyPrintError('监视模式下有进程退出', e);
		shutdown(1);
	}

	if (!userControl.pause) {
		if (!repo.disposed && term) {
			setTitle('监视');
			terminal.reset();
		}
		repo.printScreen();
	}
}
