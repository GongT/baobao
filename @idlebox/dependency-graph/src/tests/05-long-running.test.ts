import { oneDay, sleep } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { describe } from 'mocha';
import { JobGraphBuilder } from '../common/job-graph.build.js';
import { Job } from '../common/job-graph.job.js';
import { JobState } from '../common/job-graph.lib.js';
import './test-lib.js';
import { slowMode } from './test-lib.js';

class TestJob extends Job<void> {
	constructor(
		name: string,
		deps: string[],
		private readonly playback: boolean[],
	) {
		super(name, deps);
	}

	private _quit = false;

	override stop() {
		this._quit = true;
		return super.stop();
	}

	protected override async _execute(): Promise<void> {
		while (!this._quit) {
			this.setState(JobState.Running);
			await sleep(slowMode ? 1000 : 50);

			const success = this.playback.shift();
			if (success) {
				this.setState(JobState.Success);
			} else {
				this.setState(JobState.Error, new Error('test error'));
			}

			await sleep(slowMode ? 1000 : 50);

			if (this.playback.length === 0) {
				this.logger.verbose`sleep forever`;
				await new Promise(() => {
					setInterval(() => {}, oneDay);
				});
			}
		}
	}
}

describe('debug', async () => {
	it('format graph', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:works'));
		build.addNode(new TestJob('D', ['B', 'C'], [true]));
		build.addNode(new TestJob('B', ['A'], [false, true, false, true, false, true, false, true]));
		build.addNode(new TestJob('C', ['A'], [true]));
		build.addNode(new TestJob('A', [], [true]));

		const jobs = build.finalize();

		let id = 0;
		jobs.onAnyStateChange(() => {
			id++;
			console.log(jobs.debugFormatGraph());
			console.log(`${jobs.debugFormatSummary()} EXEC: ${id}`);
		});

		await jobs.startup();

		await jobs.joinAll();
	}).timeout(80000);
});
