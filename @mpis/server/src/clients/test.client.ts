import { sleep, timeout, toDisposable } from '@idlebox/common';
import { ProtocolClientObject } from '../common/protocol-client-object.js';

type IQuit = {
	timeout: number;
	resolve: boolean;
};

export class TestClient extends ProtocolClientObject {
	private intervalId?: NodeJS.Timeout;

	constructor(
		title: string,
		private readonly initMs: number,
		private readonly intervalMs: number,
		private readonly workTimeMs: number,
		private readonly statusList: readonly boolean[],
		private readonly quit?: IQuit,
	) {
		super(title);

		this._run = this._run.bind(this);
		this._register(
			toDisposable(() => {
				return this._dispose_process();
			}),
		);
	}

	protected override async _execute() {
		if (this.intervalId) throw new Error('process already spawned');

		this.logger.info('spawning %s', this._id);
		this.testMain();

		await this.testQuit();
	}

	private async testQuit() {
		if (this.quit) {
			if (this.quit.resolve) {
				await sleep(this.quit.timeout);
			} else {
				await timeout(this.quit.timeout, 'test quit');
			}
		} else {
			await new Promise(() => {
				// forever!
			});
		}
	}

	private async testMain() {
		await sleep(this.initMs);

		while (this.running) {
			await this._run();

			await sleep(this.intervalMs);
		}
	}

	private index = 0;
	private async _run() {
		const state = this.statusList[this.index++];
		if (this.index >= this.statusList.length) {
			this.index = 0;
		}

		// 模拟开始编译
		this.emitStart();

		await sleep(this.workTimeMs);

		// 模拟结束
		this.logger.info(`finish: ${state ? 'success' : 'fail'}`);
		if (state) {
			this.emitSuccess('test success');
		} else {
			this.emitFailure(new Error(`test fail`));
		}
	}

	private async _dispose_process() {
		clearInterval(this.intervalId);
		this.intervalId = undefined;
	}
}
