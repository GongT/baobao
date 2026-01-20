import { functionToDisposable, humanDate, prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsExitHandler, setExitCodeIfNot, shutdown } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import { ProcessIPCClient } from '@mpis/server';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { dumpConfig } from './commands/config.js';
import { context } from './common/args.js';
import { config } from './common/config-file.js';
import { addBreakModeDebugCommands } from './common/interactive.js';
import { initializeWorkers, workersManager } from './common/manager.js';
import { projectRoot } from './common/paths.js';
import { reprintWatchModeError } from './common/print-screen.js';
import { initializeStdin, registerCommand } from './common/stdin.js';

const cls = /\x1Bc/g;

registerNodejsExitHandler();

registerCommand({
	name: ['status', 's'],
	description: '显示当前状态',
	callback: () => reprintWatchModeError(),
});

logger.info`Running command "${context.command}" in ${projectRoot}`;

switch (context.command) {
	case 'clean':
		executeClean();
		break;
	case 'build':
		if (context.dumpConfig) {
			dumpConfig(config);
			break;
		}
		{
			if (context.withCleanup) executeClean();

			try {
				await executeBuild();

				logger.debug`build completed.`;
				setExitCodeIfNot(0);
			} catch (e: any) {
				prettyPrintError(`failed ${context.command} project`, e);
				shutdown(1);
			}
		}
		break;
	case 'watch':
		if (context.dumpConfig) {
			dumpConfig(config);
			break;
		}
		initializeStdin();
		await executeBuild().catch((e: Error) => {
			prettyPrintError(`failed ${context.command} project`, e);
			shutdown(1);
		});
		break;
}

async function executeBuild() {
	let shuttingDown = false;

	initializeWorkers();
	const graph = workersManager.finalize();

	workersManager.onTerminate((trans) => {
		const w = trans.worker;

		if (!ProcessIPCClient.is(w)) {
			logger.fatal`worker "${w._id}" is not a ProcessIPCClient, this is a bug.`;
			return;
		}

		assert.ok(w.time.executeStart);
		assert.ok(w.time.executeEnd);

		const times = `(+${humanDate.delta(w.time.executeStart, w.time.executeEnd)})`;

		if (context.watchMode && !shuttingDown) {
			printFailedRunError(w, `unexpected exit in watch mode ${times}`);
		} else if (!w.isSuccess) {
			printFailedRunError(w, `failed to execute ${times}`);
		} else {
			logger.success`"${w._id}" successfully finished ${times}.`;
		}
	});

	if (workersManager.nodeNames.length === 0) {
		logger.fatal`No workers to execute, check your config file.`;
		return;
	}

	channelClient.start();

	if (context.breakMode) {
		addBreakModeDebugCommands();
		return;
	}
	logger.verbose`Workers initialized, starting execution...`;
	await graph.startup();

	logger.verbose`Startup returned.`;

	registerGlobalLifecycle(
		functionToDisposable(() => {
			shuttingDown = true;
		}),
	);

	reprintWatchModeError();
}

function executeClean() {
	for (const folder of config.clean) {
		logger.log` * removing folder: ${folder}`;
		rmSync(folder, { recursive: true, force: true });
	}
	logger.success`Cleaned up ${config.clean.length} folders.`;
}

function printFailedRunError(worker: ProcessIPCClient, message: string) {
	if (context.watchMode && process.stderr.isTTY) process.stderr.write('\x1Bc');

	const text = worker.outputStream.toString().trimEnd().replace(cls, '');

	if (text) {
		console.error('\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m', ' '.repeat(process.stderr.columns || 80), `[@mpis/run] below is output of ${worker._id}`);

		console.error('\x1B[48;5;1m \x1B[0m commandline: %s', worker.commandline.join(' '));
		console.error('\x1B[48;5;1m \x1B[0m workdir: %s', worker.cwd);

		console.error(text);

		console.error('\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m\n', ' '.repeat(process.stderr.columns || 80), `[@mpis/run] ending output of ${worker._id}`);
	} else {
		console.error('\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m', ' '.repeat(process.stderr.columns || 80), `[@mpis/run] no output from ${worker._id}`);
	}

	const graph = workersManager.finalize();
	console.error('%s\n%s', graph.debugFormatGraph(), graph.debugFormatSummary());
	logger.error`"${worker._id}" ${message}`;
	shutdown(1);
}
