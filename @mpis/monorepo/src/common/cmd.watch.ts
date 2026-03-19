import { argv } from '@idlebox/args/default';
import { InterruptError, prettyPrintError, registerGlobalLifecycle, type IDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsGlobalTypedErrorHandlerWithInheritance, shutdown } from '@idlebox/node';
import { terminal, type ITitleControl } from '@idlebox/terminal-control';
import { debugMode } from './args.js';
import { startUi } from './user-interactive.js';
import { createMonorepoObject } from './workspace.js';

let titleControl: ITitleControl | undefined;
function setTitle(title: string) {
	if (!titleControl) {
		titleControl = terminal.title.addComponent();
		registerGlobalLifecycle(terminal.title);
	}
	titleControl.update(title);
}

export async function runWatch() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	let statePrinterDisposable: IDisposable | undefined;
	const repo = await createMonorepoObject();
	const term = process.stderr.isTTY && !debugMode;

	registerGlobalLifecycle(repo);

	startUi(repo);

	registerNodejsGlobalTypedErrorHandlerWithInheritance(InterruptError, () => {
		console.error(' -- Interrupted.');
		statePrinterDisposable?.dispose();
		shutdown(0);
	});

	process.on('SIGPIPE', () => {
		if (term) {
			terminal.erase.all(true);
		}
		logger.info`SIGPIPE received, printing current state...`;
		repo.printScreen();
	});

	if (!debugMode) {
		statePrinterDisposable = repo.onStateChange(() => {
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

		registerGlobalLifecycle(terminal.progress);
	}

	try {
		if (term) setTitle('启动');
		await repo.startup();
	} catch (e: any) {
		if (debugMode) {
			if (!repo.disposed && term) {
				terminal.reset();
			}
			repo.printScreen();
		}
		prettyPrintError('监视模式下有进程退出', e);
		shutdown(1);
	}

	if (!repo.disposed && term) {
		setTitle('监视');
		terminal.reset();
	}
	repo.printScreen();
}
