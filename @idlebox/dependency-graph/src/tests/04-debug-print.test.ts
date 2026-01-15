import { logger } from '@idlebox/logger';
import { describe } from 'mocha';
import { JobGraphBuilder } from '../common/job-graph.build.js';
import { Job } from '../common/job-graph.job.js';
import { JobState, UnrecoverableJobError } from '../common/job-graph.lib.js';
import './test-lib.js';

class TestJob extends Job<void> {
	constructor(
		name: string,
		deps: string[],
		private readonly success = true,
	) {
		super(name, deps);
	}

	protected override async _execute(): Promise<void> {
		if (this.success) {
			this.setState(JobState.SuccessExited);
		} else {
			this.setState(JobState.ErrorExited, new UnrecoverableJobError('test error'));
		}
	}
}

describe('debug', async () => {
	it('format graph', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:works'));
		build.addNode(new TestJob('D', ['B', 'C', 'A']));
		build.addNode(new TestJob('B', ['E']));
		build.addNode(new TestJob('E', ['A']));
		build.addNode(new TestJob('C', ['A']));
		build.addNode(new TestJob('A', []));

		const jobs = build.finalize();
		await jobs.startup();
		console.log(jobs.debugFormatGraph());
	});

	it('format list', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:works'));
		build.addNode(new TestJob('D', ['B', 'C', 'A']));
		build.addNode(new TestJob('B', ['E']));
		build.addNode(new TestJob('E', ['A']));
		build.addNode(new TestJob('C', ['A']));
		build.addNode(new TestJob('A', []));

		const jobs = build.finalize();
		await jobs.startup();
		console.log(jobs.debugFormatList());
	});

	it('format summary', async () => {
		const build = new JobGraphBuilder(2, logger.extend('job:works'));
		build.addNode(new TestJob('D', ['B', 'C', 'A']));
		build.addNode(new TestJob('B', ['E']));
		build.addNode(new TestJob('E', ['A']));
		build.addNode(new TestJob('C', ['A']));
		build.addNode(new TestJob('A', []));

		const jobs = build.finalize();
		await jobs.startup();
		console.log(jobs.debugFormatSummary());
	});
});
