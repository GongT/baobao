import type { IDisposable } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { AbstractBaseGraph, type ISummary } from './base-graph.js';
import { Pauser } from './job-graph.graph.pause.js';
import { Starter } from './job-graph.graph.pre.js';
import type { Job } from './job-graph.job.js';

export class JobGraph<Data, T extends Job<Data>> extends AbstractBaseGraph<T> {
	/** @internal */
	public concurrency: number = 4;

	private readonly freezer;
	private readonly bootstrap;

	/** @internal */
	public declare nodes;

	private readonly onchangeDisposables: IDisposable[] = [];

	constructor(nodesIt: Iterable<T>, logger: IMyLogger) {
		if (!logger.tag) {
			logger = logger.extend('graph');
		}
		super(nodesIt, logger);

		for (const node of this.nodes) {
			this.onchangeDisposables.push(
				node.onStateChange(() => {
					this.onNodeChange(node);
				}),
			);
		}

		this.bootstrap = Starter.make(this, logger);
		this.freezer = new Pauser(this, this.logger);
	}

	get allStarted(): boolean {
		for (const node of this.nodes) {
			if (!node.isStarted()) {
				return false;
			}
		}
		return true;
	}

	public getBlockingDependencies(parent: string): string[] {
		const r = [];
		for (const dep of this.dependenciesOf(parent, true)) {
			const node = this.getNodeByName(dep);
			if (node.isBlocking()) {
				r.push(dep);
			}
		}
		return r;
	}

	async startup() {
		this.bootstrap.starter.pump();

		try {
			await this.bootstrap.promise;

			this.logger.verbose`startup success!`;
		} catch (e) {
			this.logger.verbose`startup failed, wait nodes to finish before resolve or reject...`;
			await this.joinAll();
			this.logger.verbose`startup failed, reject now...`;
			throw e;
		}
	}

	async joinAll() {
		for (const node of this.nodes) {
			if (!node.isStarted() || node.isStopped()) {
				continue;
			}
			await node.join().catch((e) => {
				this.logger.error`error joining node ${node.name}: ${e.message}`;
			});
		}
	}

	changeConcurrency(c: number) {
		if (this.bootstrap.starter.hasDisposed) return;
		if (this.concurrency === c) return;
		this.concurrency = c;
		this.bootstrap.starter.pump();
	}

	private async onNodeChange(node: T) {
		this.logger.debug`node has change: ${node.name} -> ${node.state}`;
		if (node.isFatalError()) {
			if (this.bootstrap.starter.hasDisposed) {
				// how to send?
			} else {
			}
			this.stop();
		}
	}

	protected override inspectSummary(): ISummary {
		const statistics = { 成功: 0, 失败: 0, 队列: 0, 结束: 0, 运行中: 0 };
		for (const node of this.nodes) {
			if (node.isSuccess()) {
				statistics.成功++;
			}
			if (node.isFailling()) {
				statistics.失败++;
			}
			if (!node.isStarted()) {
				statistics.队列++;
			}
			if (node.isStopped()) {
				statistics.结束++;
			}
			if (node.isRunning()) {
				statistics.运行中++;
			}
		}

		let totalColor = '';
		if (statistics.失败) {
			totalColor = `7;38;5;1`;
		} else if (statistics.成功) {
			totalColor = `7;38;5;2`;
		} else {
			totalColor = `7`;
		}
		return { totalColor, statistics };
	}

	override debugFormatSummary(): string {
		let phase = '';
		if (!this.bootstrap.starter.hasDisposed) {
			phase = '<starting> ';
		} else if (this.stopped === 1) {
			phase = '<shutdown> ';
		}
		return `${phase}${super.debugFormatSummary()}`;
	}

	private stopped = 0;
	async stop() {
		if (this.stopped) return;

		this.logger.debug`stopping jobs...`;
		this.stopped = 1;

		for (const d of this.onchangeDisposables) {
			d.dispose();
		}
		this.onchangeDisposables.length = 0;

		this.bootstrap.starter.dispose();
		this.logger.debug`  * starter disposed`;

		await this.freezer.dispose();
		this.logger.debug`  * nodes resume`;

		const ps = this.nodes.map((e) => e.stop());
		await Promise.all(ps);
		this.logger.debug`  * stop command sent`;

		await this.joinAll();
		this.logger.debug`  * all nodes stopped`;

		this.stopped = 2;
	}

	override async dispose() {
		await this.stop();
		await super.dispose();
	}
}
