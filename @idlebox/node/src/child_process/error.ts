import { ChildProcessExitError, TimeoutError } from '@idlebox/common';
import type { Options, Result, ResultPromise } from 'execa';
import type { ChildProcess } from 'node:child_process';

interface IChildProcessStatus {
	// child_process sync return
	signal?: NodeJS.Signals | string | null;
	status?: number | null;
	error?: Error;

	// spawn async process (after promise)
	signalCode?: NodeJS.Signals | string | null;
	exitCode?: number | null;

	pid?: number;

	// execa
	signalDescription?: string;
	command?: string;
	failed?: boolean;
	timedOut?: boolean;
	isMaxBuffer?: boolean;
	isCanceled?: boolean;
	durationMs?: number;

	nodeChildProcess?: ChildProcess;
}

/** @throws */
export function checkChildProcessResult(result: IChildProcessStatus): void {
	let e: Error | undefined;
	if (result.timedOut) {
		let guessTimeout = 0;
		if (result.durationMs) {
			guessTimeout = 1000 * Math.floor(result.durationMs / 1000);
		}
		e = new TimeoutError(guessTimeout, ChildProcessExitError.describe(result));
		if (result.nodeChildProcess) {
			Object.assign(e, { nodeChildProcess: result.nodeChildProcess });
		} else if (result.pid) {
			Object.assign(e, { pid: result.pid });
		}
		throw e;
	} else if (result.failed || result.signal || result.status || result.exitCode || result.nodeChildProcess?.exitCode) {
		throw new ChildProcessExitError(result);
	}
}

type PatchResult<T extends Options> = Result<T> & {
	nodeChildProcess: ChildProcess;
};

/**
 * 还原execa早期版本的一个功能: 可从result中获取子进程的相关信息
 * @example
 * ```ts
 * const result = await patchExecaResult(execa('ls', ['-l']));
 * console.log(result.nodeChildProcess);
 * ```
 */
export function patchExecaResult<T extends Options>(promise: ResultPromise<T>): ResultPromise<T> & Promise<PatchResult<T>> {
	if (!promise.nodeChildProcess) {
		throw new Error('patchExecaResult: 参数缺少 nodeChildProcess 属性，是否传入了正确的 execa 结果对象？');
	}

	let middlePromise: Promise<any>;

	function getP() {
		if (middlePromise) return middlePromise;
		middlePromise = promise.then(
			(data) => {
				return Object.assign(data, { nodeChildProcess: promise.nodeChildProcess });
			},
			(reason) => {
				throw Object.assign(reason, { nodeChildProcess: promise.nodeChildProcess });
			},
		);

		return middlePromise;
	}

	Object.assign(promise, {
		then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) {
			return getP().then(onfulfilled, onrejected);
		},
		catch(onrejected?: (reason: any) => any) {
			return getP().catch(onrejected);
		},
	});

	return promise as any;
}
