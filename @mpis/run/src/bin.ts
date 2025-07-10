import { argv } from '@idlebox/args/default';
import { humanDate, prettyFormatError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import { CompileError, ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { rmSync } from 'node:fs';
import { printUsage } from './common/args.js';
import { loadConfigFile } from './common/config-file.js';
import { projectRoot } from './common/paths.js';

registerNodejsExitHandler();

let level = EnableLogLevel.auto;
if (argv.flag(['-d', '--debug']) > 1) {
	level = EnableLogLevel.verbose;
} else if (argv.flag(['-d', '--debug']) > 0) {
	level = EnableLogLevel.debug;
}
createRootLogger('', level);

const start = Date.now();
registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode ? 'failed' : 'success'}).`;
	}),
);

const command = argv.command(['build', 'watch', 'clean', 'init']);
if (!command) {
	printUsage();
	throw logger.fatal`No command provided. Please specify a command to run.`;
}

process.title = `MpisRun`;

logger.info`Running command "${command.value}" in ${projectRoot}`;

function finalizeArgv() {
	if (argv.unused().length > 0) {
		throw logger.fatal`Unknown arguments: ${argv.unused().join(' ')}`;
	}
}

const defaultNoClear = logger.debug.isEnabled;
let workersManager: WorkersManager;

const watchMode = command.value === 'watch';
const config = loadConfigFile(watchMode);
logger.verbose`loaded config file: ${config}`;
const errors = new Map<ProcessIPCClient, Error | null>();
switch (command.value) {
	case 'clean':
		finalizeArgv();
		executeClean();
		break;
	case 'build':
		{
			const clean = argv.flag(['--clean']) > 0;
			finalizeArgv();

			if (clean) executeClean();

			await executeBuild();
		}
		break;
	case 'watch':
		await executeBuild();
		break;
}

// channelClient.displayName = `MpisRun`;

async function executeBuild() {
	workersManager = new WorkersManager(command!.value === 'watch' ? ModeKind.Watch : ModeKind.Build);

	initializeWorkers();

	workersManager.onTerminate((w) => {
		if (!ProcessIPCClient.is(w)) {
			logger.fatal`worker "${w._id}" is not a ProcessIPCClient, this is a bug.`;
			return;
		}

		const times = `(+${humanDate.delta(w.time.executeEnd! - w.time.executeStart!)})`;

		if (watchMode) {
			printFailedRunError(w, `unexpected exit in watch mode ${times}`);
		} else if (!w.isSuccess) {
			printFailedRunError(w, `failed to execute ${times}`);
		} else {
			logger.success`"${w._id}" successfully finished ${times}.`;
		}
	});

	workersManager.finalize();

	channelClient.start();

	logger.verbose`Workers initialized, starting execution...`;
	await workersManager.startup();

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

		const worker = new ProcessIPCClient(title.replace(/\s+/g, ''), cmds.command, cmds.cwd, cmds.env);

		for (const path of config.additionalPaths) {
			worker.pathvar.add(path);
		}

		const cmd0 = typeof cmds.command === 'string' ? cmds.command.split(' ')[0] : cmds.command[0];
		worker.displayTitle = `run:${cmd0}`;

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

function printFailedRunError(worker: ProcessIPCClient, message: string) {
	if (watchMode) process.stderr.write('\x1Bc');

	const text = worker.outputStream.toString().trimEnd();

	if (text) {
		console.error(
			'\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m',
			' '.repeat(process.stderr.columns || 80),
			`below is output of ${worker._id}`,
		);
		console.error(text);

		console.error(
			'\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m\n',
			' '.repeat(process.stderr.columns || 80),
			`ending output of ${worker._id}`,
		);
	} else {
		console.error(
			'\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m',
			' '.repeat(process.stderr.columns || 80),
			`no output from ${worker._id}`,
		);
	}

	console.error(workersManager.formatDebugGraph());
	logger.fatal`"${worker._id}" ${message}`;
}

function reprintWatchModeError(noClear?: boolean) {
	if (watchMode) {
		if (!noClear && !defaultNoClear) process.stderr.write('\x1Bc');
	}
	console.error(workersManager.formatDebugGraph());
	printAllErrors();
}

function sendStatus() {
	const noError = errors.values().every((e) => !e);
	if (noError) {
		channelClient.success(`All workers completed successfully.`);
	} else {
		const errorCnt = errors.values().filter((e) => !!e);
		channelClient.failed(`${errorCnt} (of ${workersManager.size}) workers error.`, formatAllErrors());
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
	const numFailed = [...errors.values().filter((e) => !!e)].length;
	if (numFailed !== 0) {
		console.error(formatAllErrors());

		logger.error(`💥 ${numFailed} of ${workersManager.size} worker failed`);
	} else {
		logger.success(`✅ no error in ${workersManager.size} workers`);
	}
}
