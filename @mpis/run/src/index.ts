import { argv } from '@idlebox/args/default';
import { humanDate, prettyFormatError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { CompileError, ProcessIPCClient, workersManager } from '@mpis/server';
import { rmSync } from 'node:fs';
import { printUsage } from './common/args.js';
import { loadConfigFile } from './common/config-file.js';
import { projectRoot } from './common/paths.js';

registerNodejsExitHandler();

let level = EnableLogLevel.auto;
if (argv.flag(['-v', '--verbose']) > 0) {
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

logger.info`Running command "${command.value}" in ${projectRoot}`;

if (argv.unused().length > 0) {
	throw logger.fatal`Unknown arguments: ${argv.unused().join(' ')}`;
}

const watchMode = command.value === 'watch';
const config = loadConfigFile(watchMode);
logger.verbose`loaded config file: ${config}`;
const errors = new Map<ProcessIPCClient, Error>();
switch (command.value) {
	case 'clean':
		for (const folder of config.clean) {
			logger.log` * removing folder: ${folder}`;
			rmSync(folder, { recursive: true, force: true });
		}
		break;
	case 'build':
	case 'watch': {
		let last: ProcessIPCClient[] = [];
		for (const title of config.buildTitles) {
			const cmds = config.build.get(title);
			if (!cmds) throw logger.fatal`program state error, no build command "${title}"`;

			const worker = new ProcessIPCClient(title.replace(/\s+/g, ''), cmds.command, cmds.cwd, cmds.env);

			workersManager.addWorker(worker, last);

			worker.onFailure((e) => {
				errors.set(worker, e);
				reprintWatchModeError();
			});
			worker.onSuccess(() => {
				errors.delete(worker);
				reprintWatchModeError();
			});
			last = [worker];
		}

		workersManager.onTerminate((w) => {
			if (!ProcessIPCClient.is(w)) {
				logger.fatal`worker "${w.title}" is not a ProcessIPCClient, this is a bug.`;
				return;
			}

			if (watchMode) {
				printFailedRunError(w, 'unexpected exit in watch mode');
			} else if (!w.isSuccess) {
				printFailedRunError(w, 'failed to execute');
			} else {
				logger.success`"${w.title}" successfully finished.`;
			}
		});

		await workersManager.finalize();

		printAllErrors();
		break;
	}
}

function printFailedRunError(worker: ProcessIPCClient, message: string) {
	if (watchMode) process.stderr.write('\x1Bc');

	console.error(
		'\n\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m',
		' '.repeat(process.stderr.columns || 80),
		`below is output of ${worker.title}`,
	);
	console.error(worker.outputStream.toString().trimEnd());

	console.error(
		'\x1B[48;5;1m%s\r    \x1B[0;38;5;9;1m  %s  \x1B[0m\n',
		' '.repeat(process.stderr.columns || 80),
		`ending output of ${worker.title}`,
	);

	console.error(workersManager.formatDebugGraph());
	logger.fatal`"${worker.title}" ${message}`;
}

function reprintWatchModeError() {
	if (!watchMode) return;

	process.stderr.write('\x1Bc');
	printAllErrors();
}

function printAllErrors() {
	if (errors.size === 0) {
		logger.info`All workers completed successfully.`;
		return;
	}

	for (const [worker, error] of errors) {
		const band = ' '.repeat(process.stderr.columns || 80);
		const banner = `\x1B[38;5;9m${band}\r  ${worker.title}  \x1B[0m`;
		console.error(banner);
		if (error instanceof CompileError) {
			console.error(error.toString());
		} else {
			console.error(prettyFormatError(error));
		}
		console.error(banner);
	}

	console.error(`%s of %s worker failed.`, errors.size, workersManager.size);
}
