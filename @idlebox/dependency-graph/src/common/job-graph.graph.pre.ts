import { Disposable } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import type { JobGraph } from './job-graph.graph.js';
import type { Job } from './job-graph.job.js';

export class Starter<Data, T extends Job<Data>> extends Disposable {
	public state: 'pre' | 'run' | 'post';
	public readonly working = new Set<T>();
	private readonly logger: IMyLogger;
	private result?: boolean;

	private constructor(
		private readonly graph: JobGraph<Data, T>,
		logger: IMyLogger,
		private readonly deferred: { readonly resolve: () => void; readonly reject: (err: Error) => void },
	) {
		const log = logger.extend('bootstrap');
		super(log.tag);

		this.state = 'pre';
		this.logger = log;

		for (const node of graph.nodes) {
			this._register(
				node.onStateChange(() => {
					this.checkRemoveWorking(node);
					this.pump();
				}),
			);
		}
	}

	get resolved() {
		return this.result === true;
	}

	static make<Data, T extends Job<Data>>(graph: JobGraph<Data, T>, logger: IMyLogger) {
		let starter: Starter<Data, T>;
		const promise = new Promise<void>((resolve, reject) => {
			starter = new Starter(graph, logger, { resolve, reject });
		});
		return { starter: starter!, promise } as const;
	}

	override dispose() {
		if (this.state === 'post') {
			return;
		}

		if (!this.result) this.result = false;

		this.logger.verbose`dispose()`;
		super.dispose();
		this.state = 'post';
		this.pump = () => {
			this.logger.warn`pump() called after dispose()`;
		};
	}

	checkRemoveWorking(node: T) {
		if (node.isRunning()) {
			this.working.add(node);
		} else {
			this.working.delete(node);
		}

		if (node.isFatalError()) {
			const e = node.getLastError() || new Error(`node ${node.name} failed with no error attached`);
			this.logger.error`node ${node.name} fatal error: ${e.message}`;
			this.deferred.reject(e);
		}
	}

	/**
	 * 执行当前可以开始的节点的初始化过程
	 */
	pump() {
		const notStart = this.graph.nodes.filter((e) => !e.isStarted()).length;
		if (notStart === 0 && this.working.size === 0) {
			// 结束判定
			this.logger.verbose`finished`;
			this.result = true;
			this.deferred.resolve();
			this.dispose();
			return;
		}

		const remainingSlots = this.graph.concurrency - this.working.size;
		if (remainingSlots <= 0) {
			this.logger.verbose`${this.working.size} working >= ${this.graph.concurrency} max.`;
			return;
		}

		const schedule: T[] = [];
		for (const name of this.graph.overallOrder) {
			if (this.shouldExecuteNode(name)) {
				schedule.push(this.graph.getNodeByName(name));
			}
			if (schedule.length >= remainingSlots) break;
		}

		this.logger.debug`working: ${Array.from(this.working.values().map((e) => e.name)).join(', ')}, queue: ${notStart}, concurrency: ${this.graph.concurrency}, schedule to run: ${schedule.map((e) => e.name).join(', ')}`;
		if (schedule.length === 0) {
			this.logger.verbose`nothing to do this time`;
			return;
		}

		for (const node of schedule) {
			this.logger.debug`${node.name}: execute()`;
			node.execute();
			this.working.add(node);
		}
		if (this.logger) {
			this.logger.debug`after: ${this.working.size}`;
		}
	}

	/**
	 * 指定节点是否应该启动（调用 execute()）
	 * 判断依据:
	 * 	1. 此节点 !isStarted
	 *  2. 所有依赖项: !isBlocking
	 */
	protected shouldExecuteNode(name: string) {
		if (this.graph.getNodeByName(name).isStarted()) {
			// this.logger.verbose`should node ${name} execute: false (already started)`;
			return false;
		}

		const dependencies = this.graph.dependenciesOf(name, true);
		for (const depName of dependencies) {
			if (this.graph.getNodeByName(depName).isBlocking()) {
				// this.logger.verbose`should node ${name} execute: false (dependency ${depName} is blocking)`;
				return false;
			}
		}

		// this.logger.verbose`should node ${name} execute: true`;
		return true;
	}
}
