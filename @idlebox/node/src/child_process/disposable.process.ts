import { Emitter, raceTimeout, sleep, TimeoutError, type IAsyncDisposable, type IDisposableEvents } from '@idlebox/common';
import type { ChildProcess } from 'node:child_process';

interface IOptions {
	/**
	 * 优雅退出的信号，默认为SIGTERM
	 */
	readonly gracefulSignal?: NodeJS.Signals;
	/**
	 * 优雅退出的超时时间，单位毫秒，默认为5000
	 */
	readonly gracefulTimeout?: number;
	/**
	 * 强制信号，默认为SIGKILL
	 */
	readonly forceSignal?: NodeJS.Signals;
	/**
	 * 是否等待close事件，默认为true
	 * 否则只等待exit事件，可能会导致输出混乱
	 */
	readonly closed?: boolean;
}

type RequiredFields = KillRequiredFields | 'pid';

/**
 * child_process对象转换为disposable
 *
 * child_process对象本身就是disposable, 这里提供更多功能
 */
export function childProcessToDisposable(
	process: Pick<ChildProcess, RequiredFields>,
	{ gracefulSignal = 'SIGTERM', gracefulTimeout = 5000, forceSignal = 'SIGKILL', closed = true }: IOptions = {},
): IDisposableEvents & IAsyncDisposable {
	const name = process.pid ? `process-${process.pid}` : 'process-unknown';

	const beforeEvent = new Emitter<void>(`${name}:before`);
	const afterEvent = new Emitter<void>(`${name}:after`);
	const errorEvent = new Emitter<Error>(`${name}:error`);

	const state = process.exitCode ?? process.signalCode;
	let disposed = state !== null;

	const object: IDisposableEvents & IAsyncDisposable = {
		displayName: name,
		dispose,
		get disposed() {
			return disposed;
		},
		onBeforeDispose: beforeEvent.register,
		onPostDispose: afterEvent.register,
		onDisposeError: errorEvent.register,
	};

	if (disposed) {
		changeToDisposedState();
	} else {
		const promise = closed ? childProcessClosed(process) : childProcessExited(process);
		promise.then(changeToDisposedState, changeToDisposedState);
	}

	async function changeToDisposedState() {
		await sleep(0); // 确保事件监听器有机会注册

		if (disposed) return;

		// 进程自己主动退出
		beforeEvent.fireNoError();
		beforeEvent.dispose();
		disposed = true;
		afterEvent.fireNoError();
		afterEvent.dispose();
		errorEvent.dispose();
	}

	async function dispose() {
		// 由用户端发起的销毁请求
		if (disposed) return;

		beforeEvent.fireNoError();
		beforeEvent.dispose();

		try {
			await gracefulKillProcess(process, gracefulSignal, gracefulTimeout, forceSignal);
		} catch (e) {
			errorEvent.fireNoError(e as Error);
			errorEvent.dispose();
		}
		disposed = true;

		afterEvent.fireNoError();
		afterEvent.dispose();
	}

	return object;
}

type KillRequiredFields = WaitRequiredFields | 'kill';

export async function gracefulKillProcess(
	process: Pick<ChildProcess, KillRequiredFields>,
	signal: NodeJS.Signals | number = 'SIGTERM',
	timeout: number = 5000,
	killSignal: NodeJS.Signals | number = 'SIGKILL',
): Promise<string | number> {
	const isAlreadyExited = process.exitCode || process.signalCode;
	if (isAlreadyExited !== null) {
		return isAlreadyExited;
	}

	const wait = childProcessClosed(process);
	process.kill(signal);

	if (timeout <= 0 || Number.isNaN(timeout) || !Number.isFinite(timeout)) {
		return wait;
	}

	return raceTimeout(timeout, wait).catch((err) => {
		if (err instanceof TimeoutError) {
			process.kill(killSignal);
			return wait;
		}
		throw err;
	});
}

type WaitRequiredFields = 'exitCode' | 'signalCode' | 'kill' | 'on';

export function childProcessClosed(process: Pick<ChildProcess, WaitRequiredFields>): Promise<number | string> {
	const state = process.exitCode ?? process.signalCode;
	if (state !== null) {
		return Promise.resolve(state);
	}
	return new Promise((resolve) => {
		process.on('close', () => {
			resolve(process.exitCode ?? process.signalCode ?? -1);
		});
	});
}

export function childProcessExited(process: Pick<ChildProcess, WaitRequiredFields>): Promise<number | string> {
	const state = process.exitCode ?? process.signalCode;
	if (state !== null) {
		return Promise.resolve(state);
	}
	return new Promise((resolve) => {
		process.on('exit', () => {
			resolve(process.exitCode ?? process.signalCode ?? -1);
		});
	});
}
