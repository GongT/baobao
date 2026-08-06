import { ChildProcessExitError, TimeoutError } from '@idlebox/common';

interface IChildProcessStatus {
	// child_process sync return
	signal?: NodeJS.Signals | string | null;
	status?: number | null;
	error?: Error;

	// spawn async process (after promise)
	signalCode?: NodeJS.Signals | string | null;
	exitCode?: number | null;

	// execa
	signalDescription?: string;
	command?: string;
	failed?: boolean;
	timedOut?: boolean;
	isMaxBuffer?: boolean;
	isCanceled?: boolean;
	durationMs?: number;
}

/** @throws */
export function checkChildProcessResult(result: IChildProcessStatus): void {
	if (result.timedOut) {
		let guessTimeout = 0;
		if (result.durationMs) {
			guessTimeout = 1000 * Math.floor(result.durationMs / 1000);
		}
		throw new TimeoutError(guessTimeout, ChildProcessExitError.describe(result));
	} else if (result.failed || result.signal || result.status || result.exitCode) {
		throw new ChildProcessExitError(result);
	}
}
