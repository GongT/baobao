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
	killed?: boolean;
	failed?: boolean;
	timedOut?: boolean;
}

/** @throws */
export function checkChildProcessResult(result: IChildProcessStatus): void {
	const title = result.command ? `command [${result.command}] ` : 'child process ';

	if (result.error) {
		const msg: string = result.error.message || (result.error as any);
		const e = new Error(title + 'failed to start: ' + msg.replace(/^Error: /, ''));
		if (result.error.stack) {
			const stack = result.error.stack.split(/\n/);
			stack.splice(0, 1, e.message);
			e.stack = stack.join('\n');
		}
		throw e;
	}

	const code = result.exitCode ?? result.status ?? undefined;
	if (code === 0) {
		return; // yes!
	}

	let signal = result.signalCode || result.signal;

	if (result.timedOut) {
		throw new Error(title + 'timed out (killed)');
	}
	if (result.killed && !signal) {
		throw new Error(title + 'killed by unknown reason');
	}
	if (result.timedOut) {
		throw new Error(title + 'execution timed out');
	}

	if (signal) {
		if (result.signalDescription) {
			signal += `: ${result.signalDescription}`;
		}
		throw new Error(title + 'killed by signal ' + signal);
	}

	if (code !== undefined && code > 0) {
		throw new Error(title + 'exit with code ' + code);
	}

	if (result.failed) {
		throw new Error(title + 'process failed to spawn');
	}

	throw new Error(title + 'status unknown');
}
