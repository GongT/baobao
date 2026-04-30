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

const errorMessagePattern = /^Error: /;
/** @throws */
export function checkChildProcessResult(result: IChildProcessStatus): void {
	const title = result.command ? `子进程(${result.command})` : '子进程(未知命令行)';

	if (result.error) {
		const msg: string = result.error.message || (result.error as any);
		const e = new Error(`${title}未能正确启动，发生错误: ${msg.replace(errorMessagePattern, '')}`);
		if (result.error.stack) {
			const stack = result.error.stack.split('\n');
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
		throw new Error(`${title}超时终止`);
	}
	if (result.killed && !signal) {
		throw new Error(`${title}被未知原因终止`);
	}

	if (signal) {
		if (result.signalDescription) {
			signal += `: ${result.signalDescription}`;
		}
		throw new Error(`${title}被信号 ${signal} 终止`);
	}

	if (code !== undefined && code > 0) {
		throw new Error(`${title}以状态 ${code} 退出`);
	}

	if (result.failed) {
		throw new Error(`${title}启动失败`);
	}

	throw new Error(`${title}状态未知`);
}
