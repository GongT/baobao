import { argv } from '@idlebox/args/default';
import { functionToDisposable, prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { isShuttingDown, setExitCodeIfNot, shutdown } from '@idlebox/node';
import { terminal } from '@idlebox/terminal-control';
import { CompileError } from '@mpis/server';
import { url } from 'node:inspector';
import { debugMode } from '../common/args.js';
import { createMonorepoObject } from '../common/workspace.js';

export async function runBuild() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const hasCi = process.env.CI;
	const activeOutput = !debugMode && !hasCi && !url();
	const repo = await createMonorepoObject();

	if (activeOutput) {
		repo.onStateChange(() => {
			if (isShuttingDown()) return;
			if (process.stderr.isTTY) {
				terminal.erase.all(true);
				terminal.progress.update(repo.getProgress());
			}
			repo.printScreen();
		});
	}
	if (hasCi) {
		repo.onStateChange((project) => {
			if (isShuttingDown()) return;

			const worker = repo._debugWorker(project);
			if (!worker) {
				console.error(`[impossible] Worker for project ${project.name} not found`);
				return;
			}
			if (worker.isSuccess || worker.isFail) {
				console.log(`::group::${worker.isSuccess ? '✅' : '❌'} ${worker.displayTitle}`);
				console.log(worker.outputStream.toString().trim());
				console.log(`::endgroup::`);
			}
		});
	}

	registerGlobalLifecycle(
		functionToDisposable(() => {
			terminal.progress.clear();
		}),
	);

	try {
		await repo.startup();

		logger.success('Monorepo started successfully');
		// completed = true;
		setExitCodeIfNot(0);
	} catch (error: any) {
		if (activeOutput) {
			terminal.reset();
		} else {
			console.error('='.repeat(process.stderr.columns || 80));
		}
		repo.printScreen(false, true);

		if (!logger.debug.isEnabled && error instanceof CompileError) {
			logger.error`编译失败: ${error.message}`;
		} else {
			prettyPrintError('monorepo build', error);
		}
		shutdown(1);
	}
}
