import { sleep } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { expect } from 'chai';
import { describe } from 'mocha';
import { JobGraphBuilder } from '../common/job-graph.build.js';
import { Job } from '../common/job-graph.job.js';
import { JobState, UnrecoverableJobError } from '../common/job-graph.lib.js';
import './test-lib.js';
import { slowMode } from './test-lib.js';

class SimpleJob extends Job<void> {
	constructor(
		name: string,
		deps: string[],
		private readonly success = true,
	) {
		super(name, deps);
	}

	protected override async _execute(): Promise<void> {
		this.logger.verbose`is execute!`;
		await sleep(slowMode ? 1000 : 50);
		if (this.success) {
			this.logger.verbose`is success!`;
			this.setState(JobState.SuccessExited);
		} else {
			this.logger.verbose`is error!`;
			this.setState(JobState.ErrorExited, new UnrecoverableJobError('test error'));
		}
	}

	// override [inspect.custom]() {
	// 	return `[SimpleJob ${this.name} (${this.success})]`;
	// }
}

describe('job-graph', () => {
	it('works', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:works'));
		build.addNode(new SimpleJob('A', []));
		build.addNode(new SimpleJob('B', ['A']));
		build.addNode(new SimpleJob('C', ['A']));
		build.addNode(new SimpleJob('D', ['B', 'C']));

		const jobs = build.finalize();
		await jobs.startup();
	}).timeout(slowMode ? Infinity : 3000);

	it('error when job fail', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:error'));
		const na = build.addNode(new SimpleJob('A', []));
		const nb = build.addNode(new SimpleJob('B', ['A'], false));
		const nc = build.addNode(new SimpleJob('C', ['A']));
		const nd = build.addNode(new SimpleJob('D', ['B', 'C']));

		const jobs = build.finalize();
		await expect(jobs.startup()).to.eventually.rejectedWith('test error');

		expect(na.isSuccess()).to.equals(true);
		expect(nb.isFailling()).to.equals(true);
		expect(nc.isSuccess()).to.equals(true);
		expect(nd.isStarted()).to.equals(false);
	}).timeout(slowMode ? Infinity : 3000);
});
