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

		if (!logger.debug.isEnabled) {
			console.error('%s\n%s', graph.debugFormatList(), graph.debugFormatSummary());
		}
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

export function formatAllErrors(noColor = false) {
	const lines: string[] = [''];
	const colorEnabled = !noColor && logger.colorEnabled;
	let index = 0;
	for (const [workerId, error] of overallState.errors) {
		if (error === null) continue;

		index++;

		let tag = '';
		if (error.name !== 'Error') {
			tag = ` (${error.name})`;
		}
		const banner = colorEnabled ? `\x1B[48;5;9m ERROR ${index} \x1B[0m` : `ERROR ${index}`;
		const bs1 = colorEnabled ? '' : '┏';
		const bs2 = colorEnabled ? '' : '┗';

		lines.push(`${bs1}${banner}${tag} ${workerId}`);

		let body;
		if (error instanceof CompileError) {
			body = error.toString();
		} else if (error instanceof Error) {
			body = prettyFormatError(error);
		} else {
			body = `@mpis/run: 无法处理此错误信息: ${error}`;
		}
		lines.push(colorEnabled ? indentColor(body) : indentAnsi(body));

		lines.push(`${bs2}${banner} ${workerId}`);
	}
	return lines.join('\n');
}

const eachLineStart = /^/gm;
function indentColor(text: string) {
	return text.trimEnd().replace(eachLineStart, '\x1B[48;5;9m \x1B[49m ');
}

function indentAnsi(text: string) {
	return text.trimEnd().replace(eachLineStart, '┃ ');
}

registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode !== 0 ? 'failed' : 'success'}).`;
	}),
);

export function printOutput(name: string) {
	console.log(`printing output of ${name}`);
}
