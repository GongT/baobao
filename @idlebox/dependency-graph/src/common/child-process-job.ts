import { timeout } from '@idlebox/common';
import type { ResultPromise } from 'execa';
import { Job } from './job-graph.job.js';
import { JobState } from './job-graph.lib.js';
import { pause, type IPauseableObject, type IPauseControl } from './pause-interface.js';

export abstract class ChildProcessExecuter<T> extends Job<T> implements IPauseableObject {
	private declare process: ResultPromise;

	protected abstract _spawn(): ResultPromise;

	protected override async _execute(): Promise<undefined> {
		this.process = this._spawn();
		await this.process;
	}

	private _is_paused = false;
	readonly [pause]: IPauseControl = {
		isPaused: () => {
			return this._is_paused;
		},
		pause: async () => {
			if (this._is_paused) return;
			this.process.kill('SIGSTOP');
			this._is_paused = true;
		},

		resume: async () => {
			if (!this._is_paused) return;
			this.process.kill('SIGCONT');
			this._is_paused = false;
		},
	};

	override async join() {
		await this.process;
	}

	override async stop(): Promise<void> {
		this.process.kill('SIGTERM');
		await Promise.race([this.process, timeout(5000)]).catch(() => {
			this.logger.warn`stop process timeout, sending SIGKILL`;
			this.process.kill('SIGKILL');
			return Promise.race([this.process, timeout(2000, 'critical kernel call fail: not able to kill process')]);
		});
		if (!this.isStopped()) {
			this.setState(JobState.ErrorExited, new Error('stop by parent'));
		}
	}

	//////////////////////////////
	public override translateState(): string {
		if (!this.process) return 'not-spawn';
		const pause = this._is_paused ? ' /paused/ ' : ' ';
		return `[pid=${this.process.pid}]${pause}${this._state}`;
	}
}
