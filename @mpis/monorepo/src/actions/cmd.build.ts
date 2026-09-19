import { argv } from '@idlebox/args/default';
import { convertCaughtError, functionToDisposable, Interval, prettyPrintError, registerGlobalLifecycle, RequiredMap, type IDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { CollectingStream, isShuttingDown, shutdown } from '@idlebox/node';
import { terminal } from '@idlebox/terminal-control/default';
import { CompileError } from '@mpis/server';
import { url } from 'node:inspector';
import { debugMode } from '../common/args.js';
import { createMonorepoObject } from '../common/workspace.js';
import { createBuildStatePrinter } from '../user-interactive/state-printer.js';

const ciState = new RequiredMap<string, ReturnType<typeof createProjectState>>();
function createProjectState(displayTitle: string) {
	const buffer = new CollectingStream();
	const timer = new Interval(300);
	timer.onTick(() => {
		if (isShuttingDown()) return;
		flush();
	});
	const r = { timer, buffer, status: false };

	function flush() {
		const output = buffer.getOutput().trim();
		if (!output) return;

		console.log(`::group::${r.status ? '✅ 成功' : '❌ 失败'} - ${displayTitle}`);
		if (output) {
			console.log(output);
		}
		console.log(`::endgroup::`);

		buffer.clear();
	}

	registerGlobalLifecycle(
		functionToDisposable(() => {
			timer.dispose();
			flush();
		}),
	);

	return r;
}

export async function runBuild() {
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const hasCi = !!process.env.CI;
	const activeOutput = !debugMode && !hasCi && !url();
	const repo = await createMonorepoObject();

	let bsd: undefined | IDisposable;
	if (activeOutput) {
		bsd = createBuildStatePrinter(repo);
	}

	let cid;
	if (hasCi) {
		cid = repo.onStateChange((project) => {
			if (isShuttingDown()) return;

			const worker = repo._debugWorker(project);
			if (!worker) {
				console.error(`[impossible] Worker for project ${project.name} not found`);
				return;
			}

			const state = ciState.entry(worker.displayTitle, createProjectState);
			if (worker.isSuccess || worker.isFail) {
				const output = worker.outputStream.toString().trim();
				if (output) {
					state.buffer.write(output);
				}
				state.status = worker.isSuccess;
				state.timer.reset();

				// console.error(repo.workersManager.finalize().debugFormatSummary());
			} else {
				// start
				state.status = false;
				state.buffer.clear();
				state.timer.pause();
			}
		});
	}

	try {
		await repo.startup();
		bsd?.dispose();
		cid?.dispose();

		logger.success('Monorepo started successfully');
		// completed = true;
	} catch (error: any) {
		bsd?.dispose();
		cid?.dispose();

		const e = convertCaughtError(error);
		if (activeOutput) {
			terminal.reset();
		} else {
			console.error('='.repeat(process.stderr.columns || 80));
		}
		repo.printScreen(false, true);

		if (!logger.debug.isEnabled && e instanceof CompileError) {
			logger.error`编译失败: ${e.message}`;
		} else {
			prettyPrintError('monorepo build', e);
		}
		shutdown(1);
	}

	shutdown(0);
}
