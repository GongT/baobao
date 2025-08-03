import { createLogger, type IMyLogger } from '@idlebox/logger';
import { AbstractGraphBuilder } from './base-graph.js';
import { JobGraph } from './job-graph.graph.js';
import { EmptyJob, type Job } from './job-graph.job.js';

/**
 * 依赖关系启动过程
 */
export class JobGraphBuilder<D, J extends Job<D>> extends AbstractGraphBuilder<J, JobGraph<D, J>> {
	constructor(
		private readonly concurrency: number = 4,
		logger: IMyLogger = createLogger('graph:job'),
	) {
		super(logger);
	}

	addEmptyNode(name: string) {
		this.nodes.add(new EmptyJob(name) as unknown as J);
	}

	protected override _finalize() {
		const r = new JobGraph(this.nodes, this.logger);
		r.changeConcurrency(this.concurrency);
		return r;
	}

	override finalize() {
		if (!this.finalized) {
			for (const node of this.nodes) {
				if (node instanceof EmptyJob) {
					this.removeNode(node);
				}
			}
		}
		return super.finalize();
	}
}
