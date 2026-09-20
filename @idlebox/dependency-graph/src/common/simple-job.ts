import type { CancellationToken } from '@idlebox/common';
import { Job } from './job-graph.job.js';

type JobFn<T> = (this: SimpleJob<T>, token: CancellationToken) => Promise<void>;

export class SimpleJob<T> extends Job<T> {
	constructor(
		name: string,
		deps: readonly string[],
		private readonly job: JobFn<T>,
	) {
		super(name, deps);
	}

	protected override async _execute(token: CancellationToken) {
		await this.job(token);
		return undefined;
	}

	protected override async _stop(): Promise<void> {}
}
