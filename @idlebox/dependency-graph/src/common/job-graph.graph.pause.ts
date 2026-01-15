import { AsyncDisposable, toDisposable } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import type { JobGraph } from './job-graph.graph.js';
import type { Job } from './job-graph.job.js';
import { getPauseControl, type IPauseControl } from './pause-interface.js';

export class Pauser<Data, T extends Job<Data>> extends AsyncDisposable {
	private readonly logger: IMyLogger;
	private pauseControl = new Map<string, IPauseControl>();

	constructor(
		private readonly graph: JobGraph<Data, T>,
		logger: IMyLogger,
	) {
		const l = logger.extend('pause');
		super(l.tag);
		this.logger = l;

		for (const node of graph.nodes) {
			const pause = getPauseControl(node);
			if (pause) {
				this.pauseControl.set(node.name, pause);
				this._register(
					toDisposable(async () => {
						if (pause.isPaused()) {
							this.logger.verbose`dispose: resume paused node: ${node.name}`;
							await pause.resume();
						}
					}),
				);
			}
			this._register(
				node.onStateChange(() => {
					this.onNodeChange(node);
				}),
			);
		}

		if (this.pauseControl.size === 0) {
			this.logger.debug`no pause control found, will not pause anything`;
			this.dispose();
		} else {
			this.logger.debug`found ${this.pauseControl.size} pause controls`;
		}
	}

	override async dispose() {
		if (this.hasDisposed) return;
		return super.dispose();
	}

	private async onNodeChange(node: T) {
		if (node.isBlocking()) {
			await this.pauseDependents(node);
		} else {
			await this.resumeRelated(node);
		}
	}

	async pauseDependents<T extends Job<Data>>(node: T) {
		for (const name of this.graph.dependantsOf(node.name, true)) {
			const pause = this.pauseControl.get(name);
			if (!pause || pause.isPaused()) continue;

			const node = this.graph.getNodeByName(name);
			if (!node.isStarted()) {
				this.logger.verbose`skip pause ${name}: not started`;
				continue;
			}

			this.logger.verbose`pause node ${name}`;
			await pause.pause();
		}
	}

	async resumeRelated<T extends Job<Data>>(node: T) {
		for (const name of this.graph.dependantsOf(node.name, false)) {
			const pause = this.pauseControl.get(name);
			if (!pause || !pause.isPaused()) continue;

			if (await this._check_node_resume(name)) {
				this.logger.verbose`will resume ${name}`;
				await pause.resume();
			} else {
				this.logger.verbose`not resume ${name}, because it has blocking dependencies`;
			}
		}
	}

	private async _check_node_resume(name: string) {
		for (const parentName of this.graph.dependenciesOf(name, true)) {
			const parentNode = this.graph.getNodeByName(parentName);
			if (parentNode.isBlocking()) {
				return false;
			}
		}
		return true;
	}
}
