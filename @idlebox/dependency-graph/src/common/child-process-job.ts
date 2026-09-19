import { timeout } from '@idlebox/common';
import type { ResultPromise } from 'execa';
import { setInterval } from 'node:timers/promises';
import { Job } from './job-graph.job.js';
import { JobState } from './job-graph.lib.js';

export abstract class ChildProcessExecuter<T> extends Job<T> {
	private killing = '';

	private declare process: ResultPromise;

	protected abstract _spawn(): ResultPromise;

	protected override async _execute(): Promise<undefined> {
		this.process = this._spawn();
		await this.process;
	}

	// TODO: 恢复运行的逻辑有问题，需要排查
	/** 暂停机制，需要暂停整个进程组 */
	// private _is_paused = false;
	// readonly [pause]: IPauseControl = {
	// 	// implements IPauseableObject
	// 	isPaused: () => {
	// 		return this._is_paused;
	// 	},
	// 	pause: async () => {
	// 		if (this._is_paused) return;
	// 		this.process.kill('SIGSTOP');
	// 		this._is_paused = true;
	// 	},

	// 	resume: async () => {
	// 		if (!this._is_paused) return;
	// 		this.process.kill('SIGCONT');
	// 		this._is_paused = false;
	// 	},
	// };

	override async join() {
		await this.process;
	}

	private send_singal(sig: NodeJS.Signals) {
		this.killing = sig;
		this.logger.debug`发送信号 ${sig}`;
		this.process.kill(sig);
	}

	private async _kill() {
		this.send_singal('SIGKILL');
		await Promise.race([this.process, timeout(2000, '操作系统异常，无法使用SIGKILL杀死进程')]);
	}

	override async stop(kill = false): Promise<void> {
		if (kill) {
			await this._kill();
		} else {
			this.send_singal('SIGTERM');
			try {
				await Promise.race([this.process, timeout(5000)]);
			} catch {
				this.logger.warn`使用 SIGTERM 超时，改为使用 SIGKILL`;
				await this._kill();
			}
		}

		let wait = 0;
		for await (const _ of setInterval(200)) {
			if (this.isStopped()) {
				this.killing = '';
				return;
			}
			wait += 1;
			if (wait >= 5) break; // 等待 1 秒后仍未停止，强制设置错误状态
		}

		this.killing = '';
		this.setState(JobState.ErrorExited, new Error(`上级停止了该进程，本级${this.constructor.name}未及时更新状态`));
	}

	//////////////////////////////
	public override translateState(): string {
		if (!this.process) return '未启动';
		// const pause = this._is_paused ? ' |已暂停| ' : ' ';
		const pause = ' ';
		let ss: string = this._state;
		if (this.killing) {
			ss += `(${this.killing}...)`;
		}
		return `[pid=${this.process.pid}]${pause}${ss}`;
	}
}
