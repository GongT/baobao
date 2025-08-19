import { humanDate, prettyFormatError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { registerNodejsExitHandler, setExitCodeIfNot, shutdown } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import { CompileError, ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { rmSync } from 'node:fs';
import { dumpConfig } from './commands/config.js';
import { context, parseCliArgs } from './common/args.js';
import { loadConfigFile } from './common/config-file.js';
import { projectRoot } from './common/paths.js';
import { initializeStdin, registerCommand } from './common/stdin.js';

registerNodejsExitHandler();

parseCliArgs();

let execute_index = 0;
const start = Date.now();
registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode ? 'failed' : 'success'}).`;
	}),
);

registerCommand({
	name: ['status', 's'],
	description: '显示当前状态',
	callback: () => reprintWatchModeError(),
});

process.title = `MpisRun`;

logger.info`Running command "${context.command}" in ${projectRoot}`;

const defaultNoClear = logger.debug.isEnabled || !process.stderr.isTTY;
let workersManager: WorkersManager;

const config = loadConfigFile(context.watchMode);
logger.verbose`loaded config file: ${config}`;
const errors = new Map<ProcessIPCClient, Error | null>();

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
				logger.error`failed ${context.command} project: ${e.message}`;
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
			logger.error`failed ${context.command} project: ${e.message}`;
			shutdown(1);
		});
		break;
}

// channelClient.displayName = `MpisRun`;

async function executeBuild() {
	workersManager = new WorkersManager(context.watchMode ? ModeKind.Watch : ModeKind.Build);

	initializeWorkers();
	const graph = workersManager.finalize();

	workersManager.onTerminate((trans) => {
		const w = trans.worker;

		if (!ProcessIPCClient.is(w)) {
			logger.fatal`worker "${w._id}" is not a ProcessIPCClient, this is a bug.`;
			return;
		}

		const times = `(+${humanDate.delta(w.time.executeStart!, w.time.executeEnd!)})`;

		if (context.watchMode) {
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
		logger.warn`Break mode enabled, waiting for input command...`;
		addDebugCommand();
		return;
	}
	logger.verbose`Workers initialized, starting execution...`;
	await graph.startup();

	logger.verbose`Startup returned.`;

	reprintWatchModeError();
}

function executeClean() {
	for (const folder of config.clean) {
		logger.log` * removing folder: ${folder}`;
		rmSync(folder, { recursive: true, force: true });
	}
	logger.success`Cleaned up ${config.clean.length} folders.`;
}

function initializeWorkers() {
	let last: ProcessIPCClient | undefined;
	for (const title of config.buildTitles) {
		const cmds = config.build.get(title);
		if (!cmds) throw logger.fatal`program state error, no build command "${title}"`;

		if (!cmds.env['DEBUG']) cmds.env['DEBUG'] = '';
		if (!cmds.env['DEBUG_LEVEL']) cmds.env['DEBUG_LEVEL'] = '';
		const worker = new ProcessIPCClient(title.replace(/\s+/g, ''), cmds.command, cmds.cwd, cmds.env);

		for (const path of config.additionalPaths) {
			worker.pathvar.add(path);
		}

		worker.displayTitle = `run:${cmds.command[0]}`;

		workersManager.addWorker(worker, last ? [last._id] : []);

		let nodeFirstTime = true;
		worker.onFailure((e) => {
			errors.set(worker, e);
			reprintWatchModeError(nodeFirstTime);
			nodeFirstTime = false;
			sendStatus();
		});
		worker.onSuccess(() => {
			errors.set(worker, null);
			if (nodeFirstTime) {
				nodeFirstTime = false;
			} else {
				reprintWatchModeError();
			}
			sendStatus();
		});

		last = worker;
	}
}

const cls = /\x1Bc/g;

function printFailedRunError(worker: ProcessIPCClient, message: string) {
	if (context.watchMode && process.stderr.isTTY) process.stderr.write('\x1Bc');

	const text = worker.outputStream.toString().trimEnd().replace(cls, '');

	if (text) {
		console.error('\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m', ' '.repeat(process.stderr.columns || 80), `[@mpis/run] below is output of ${worker._id}`);
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

let printTo: NodeJS.Timeout | undefined;
function reprintWatchModeError(noClear?: boolean) {
	if (printTo) clearTimeout(printTo);
	printTo = setTimeout(() => {
		printTo = undefined;

		if (context.watchMode) {
			if (!noClear && !defaultNoClear) process.stderr.write('\x1Bc');
		}
		const graph = workersManager.finalize();
		console.error('%s\n%s', graph.debugFormatList(), graph.debugFormatSummary());
		printAllErrors();
	}, 50);
}

function addDebugCommand() {
	registerCommand({
		name: ['continue', 'c'],
		description: '开始执行',
		callback: () => {
			workersManager.finalize().startup();
		},
	});
	registerCommand({
		name: ['debug'],
		description: '切换调试模式（仅在启动前有效）',
		callback: (text: string) => {
			const [_, index, on_off] = text.split(/\s+/);
			const list = workersManager._allWorkers as ProcessIPCClient[];
			const worker = list[Number(index)];
			if (!worker) {
				logger.error`worker index out of range: ${index}`;
				return;
			}
			if (on_off === 'on') {
				worker.env['DEBUG'] = '*,-executer:*,-dispose:*';
				worker.env['DEBUG_LEVEL'] = 'verbose';
				logger.success`debug mode enabled for worker "${worker._id}"`;
			} else if (on_off === 'off') {
				worker.env['DEBUG'] = '';
				worker.env['DEBUG_LEVEL'] = '';
				logger.success`debug mode disabled for worker "${worker._id}"`;
			} else {
				logger.error`invalid argument: ${text}`;
			}
		},
	});
	// registerCommand({
	// 	name: ['print', 'p'],
	// 	description: '显示命令执行输出',
	// 	callback: () => {
	// 	},
	// });
}

function sendStatus() {
	const noError = errors.values().every((e) => !e);
	if (noError) {
		channelClient.success(`all ${workersManager.size()} workers completed successfully.`);
	} else {
		let errorCnt = 0;
		const arr: string[] = [];
		for (const [client, err] of errors.entries()) {
			if (err) {
				errorCnt++;
				arr.push(client._id);
			}
		}
		channelClient.failed(`mpis-run: ${arr.join(', ')} (${errorCnt} / ${workersManager.size()})`, formatAllErrors());
	}
}

function formatAllErrors() {
	const lines: string[] = [];
	const colorEnabled = logger.colorEnabled;
	let index = 0;
	for (const [worker, error] of errors) {
		if (error === null) continue;

		index++;

		let tag = '';
		if (error.name !== 'Error') {
			tag = ` (${error.name})`;
		}
		const banner = colorEnabled ? `\x1B[48;5;9m ERROR ${index} \x1B[0m` : `ERROR ${index}`;
		lines.push(`\n${banner}${tag} ${worker._id}`);
		if (error instanceof CompileError) {
			lines.push(error.toString());
		} else if (error instanceof Error) {
			lines.push(prettyFormatError(error));
		} else {
			lines.push(`can not handle error: ${error}`);
		}
		lines.push(`\n${banner} ${worker._id}`);
	}
	return lines.join('\n');
}

function printAllErrors() {
	execute_index++;
	const execTip = `exec: ${execute_index} / ${humanDate.delta(Date.now() - start)}`;

	const numFailed = [...errors.values().filter((e) => !!e)].length;
	if (numFailed !== 0) {
		console.error(formatAllErrors());

		logger.error(`💥 ${numFailed} of ${workersManager.size()} worker failed (${execTip})`);
	} else {
		logger.success(`✅ no error in ${workersManager.size()} workers (${execTip})`);
	}
}
