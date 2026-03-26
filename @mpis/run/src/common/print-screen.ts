import { humanDate, prettyFormatError, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { terminal, type ITitleControl } from '@idlebox/terminal-control/default';
import { CompileError } from '@mpis/server';
import { context } from './args.js';
import { workersManager } from './manager.js';

export const overallState = {
	errors: new Map<string, Error | null>(),
	busyWorkers: new Set<string>(),
	startedWorkers: new Set<string>(),
};

let printTmr: NodeJS.Timeout | undefined;
let titleControl: ITitleControl | undefined;

export function initializeScreen() {
	const defaultNoClear = logger.debug.isEnabled || !process.stderr.isTTY;

	if (!defaultNoClear) {
		titleControl = terminal.title.addComponent();
		terminal.title.addComponent().update(`run: ${process.env.npm_lifecycle_event || context().command}`);
	}
}

export function updateMiscState() {
	if (!titleControl) return;

	const firstBusyWorker = overallState.busyWorkers.keys().toArray().at(-1);

	if (firstBusyWorker) {
		terminal.progress.indeterminate();
		titleControl.update(`⏳ ${firstBusyWorker}`);
	} else if (overallState.errors.size > 0) {
		terminal.progress.error();
		titleControl.update('💥');
	} else {
		terminal.progress.clear();
		titleControl.update('✅');
	}
}

export function reprintWatchModeError(noClear?: boolean) {
	if (printTmr) clearTimeout(printTmr);

	updateMiscState();

	printTmr = setTimeout(() => {
		printTmr = undefined;

		const graph = workersManager.finalize();

		if (context().watchMode && !noClear) {
			terminal.resetIf(!logger.debug.isEnabled);
		}

		console.error('%s\n%s', graph.debugFormatList(), graph.debugFormatSummary());
		printAllErrors();
	}, 50);
}

let execute_index = 0;
const start = Date.now();

function printAllErrors() {
	execute_index++;
	const execTip = `exec: ${execute_index} / ${humanDate.delta(Date.now() - start)}`;

	const numFailed = [...overallState.errors.values().filter((e) => !!e)].length;
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
	for (const [wId, error] of overallState.errors) {
		if (error === null) continue;

		index++;

		let tag = '';
		if (error.name !== 'Error') {
			tag = ` (${error.name})`;
		}
		const banner = colorEnabled ? `\x1B[48;5;9m ERROR ${index} \x1B[0m` : `ERROR ${index}`;
		lines.push(`\n${banner}${tag} ${wId}`);
		if (error instanceof CompileError) {
			lines.push(error.toString());
		} else if (error instanceof Error) {
			lines.push(prettyFormatError(error));
		} else {
			lines.push(`can not handle error: ${error}`);
		}
		lines.push(`\n${banner} ${wId}`);
	}
	return lines.join('\n');
}

registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode !== 0 ? 'failed' : 'success'}).`;
	}),
);

export function printOutput(name: string) {
	console.log(`printing output of ${name}`);
}
