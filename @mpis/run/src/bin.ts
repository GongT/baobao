import { functionToDisposable, humanDate, prettyPrintError, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsExitHandler, setExitCodeIfNot, shutdown } from '@idlebox/node';
import { terminal } from '@idlebox/terminal-control/default';
import { channelClient } from '@mpis/client';
import { ProcessIPCClient } from '@mpis/server';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { basename, dirname, sep } from 'node:path';
import { inspect } from 'node:util';
import { dumpConfig } from './commands/config.js';
import { context, initializeLogger } from './common/args.js';
import { config, loadConfig } from './common/config-file.js';
import { addBreakModeDebugCommands } from './common/interactive.js';
import { initializeWorkers, workersManager } from './common/manager.js';
import { projectRoot } from './common/paths.js';
import { initializeScreen, printOutput, reprintWatchModeError } from './common/print-screen.js';
import { initializeStdin, registerCommand } from './common/stdin.js';

const cls = /\x1Bc/g;

registerNodejsExitHandler();

initializeLogger();

logger.debug`commandline: commandline<${process.argv}>`;
logger.debug`working directory: long<${process.cwd()}>`;
logger.debug`NODE_OPTIONS: long<${process.env.NODE_OPTIONS}>`;
logger.debug`execArgv: long<${process.execArgv}>`;
logger.debug`nodejs version: long<${process.version}>`;

loadConfig();
initializeScreen();

registerCommand({
	name: ['status', 's'],
	description: '显示当前状态',
	callback: () => reprintWatchModeError(),
});
registerCommand({
	name: ['output', 'o'],
	description: '显示输出',
	callback: printOutput,
});

logger.info`Running command "${context().command}" in ${projectRoot}`;

switch (context().command) {
	case 'clean':
		executeClean();
		break;
	case 'build':
		if (context().dumpConfig) {
			dumpConfig(config);
			break;
		}
		{
			terminal.progress.indeterminate();
			if (context().withCleanup) executeClean();

			try {
				await executeBuild();

				logger.debug`build completed.`;
				setExitCodeIfNot(0);
			} catch (e: any) {
				prettyPrintError(`failed ${context().command} project`, e);
				shutdown(1);
			}
		}
		break;
	case 'watch':
		if (context().dumpConfig) {
			dumpConfig(config);
			break;
		}
		terminal.progress.indeterminate();
		initializeStdin();
		await executeBuild().catch((e: Error) => {
			prettyPrintError(`failed ${context().command} project`, e);
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

		if (context().watchMode && !shuttingDown) {
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

	if (context().breakMode) {
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

function colorfulName(path: string) {
	const dir = dirname(path);
	const base = basename(path);

	return `\x1B[2m${dir || '???'}\x1B[0m${sep}\x1B[38;5;2m${base}\x1B[0m`;
}

function printFailedRunError(worker: ProcessIPCClient, message: string) {
	terminal.resetIf(context().watchMode && !logger.debug.isEnabled);

	let text = worker.outputStream.toString().trimEnd().replace(cls, '');

	if (!text) {
		text = `工作进程 "${worker._id}" 没有任何输出`;
		text = inspect(worker, { colors: true });
	}

	console.error(
		'\n\x1B[48;5;1m%s\r\x1B[48;5;1m    \x1B[0;38;5;9;1m  %s  \x1B[0m',
		' '.repeat(process.stderr.columns || 80),
		`[@mpis/run] 以下是 "${worker._id}" 的输出`,
	);

	console.error('\x1B[48;5;1m \x1B[0m commandline: %s %s', colorfulName(worker.commandline[0] ?? ''), worker.commandline.slice(1).join(' '));
	console.error('\x1B[48;5;1m \x1B[0m workdir: %s', worker.cwd);

	let specialState = '';
	if (worker.targetState.signal) {
		specialState = `目标被信号 ${worker.targetState.signal} 杀死`;
	} else if (worker.targetState.exitCode) {
		specialState = `目标以代码 ${worker.targetState.exitCode} 退出`;
	} else if (!worker.targetState.failedExecute) {
		specialState = `目标启动失败`;
	} else if (!worker.targetState.started) {
		specialState = `目标无法启动`;
	}
	if (specialState) {
		console.error('\x1B[48;5;1m \x1B[0;38;5;11m \u26A0 %s\x1b[0m', specialState);
	}

	console.error('');
	console.error(text.trim());

	console.error(
		'\n\x1B[48;5;1m%s\r\x1B[48;5;1m    \x1B[0;38;5;9;1m  %s  \x1B[0m',
		' '.repeat(process.stderr.columns || 80),
		`[@mpis/run] 结束 "${worker._id}" 的输出`,
	);

	const graph = workersManager.finalize();
	console.error('%s\n%s', graph.debugFormatGraph(), graph.debugFormatSummary());
	logger.error`"${worker._id}" ${message}`;
	shutdown(1);
}
