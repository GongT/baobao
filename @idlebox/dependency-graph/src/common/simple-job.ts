import { Job } from './job-graph.job.js';

type JobFn<T> = (this: SimpleJob<T>) => Promise<void>;

export class SimpleJob<T> extends Job<T> {
	constructor(
		name: string,
		deps: readonly string[],
		private readonly job: JobFn<T>,
	) {
		super(name, deps);
	}

	protected override async _execute() {
		await this.job();
		return undefined;
	}
}
