import { humanDate, prettyFormatError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { CompileError, type ProcessIPCClient } from '@mpis/server';
import { context } from './args.js';
import { workersManager } from './manager.js';

let printTo: NodeJS.Timeout | undefined;
const defaultNoClear = logger.debug.isEnabled || !process.stderr.isTTY;
export const errors = new Map<ProcessIPCClient, Error | null>();

export function reprintWatchModeError(noClear?: boolean) {
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

let execute_index = 0;
const start = Date.now();

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

export function formatAllErrors() {
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

registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode !== 0 ? 'failed' : 'success'}).`;
	}),
);
