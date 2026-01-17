import { Emitter } from '@idlebox/common';
import { getPauseControl, Job, JobGraphBuilder, JobState, pause, UnrecoverableJobError } from '@idlebox/dependency-graph';
import { createLogger } from '@idlebox/logger';
import { inspect, type InspectOptionsStylized } from 'node:util';
import type { ProtocolClientObject } from './protocol-client-object.js';

const MAX_STARTING = 4;

class EventTranslate extends Job<string> {
	constructor(
		name: string,
		dependencies: readonly string[],
		public readonly worker: ProtocolClientObject,
		public readonly mode: ModeKind,
	) {
		super(name, dependencies);

		worker.onStart(() => {
			this.setState(JobState.Running);
		});
		worker.onSuccess((evt) => {
			this.setState(JobState.Success, evt.message);
		});
		worker.onFailure((err) => {
			this.setState(JobState.Error, err);
		});
	}

	protected override async _execute(): Promise<undefined> {
		await this.worker.execute();

		this.logger.debug`worker execute() return | state = ${this._state}`;
		if (this.mode === ModeKind.Watch && !this.worker.hasDisposed) {
			if (this.isFatalError()) return;

			this.logger.warn`this is watcher, it should not quit!`;
			this.setState(JobState.ErrorExited, new UnrecoverableJobError(`项目"${this.name}"的watch脚本在监视模式下未持续运行`));
			return;
		}

		if (this.isSuccess()) {
			const lastD = this.getLastData() as any;
			this.setState(JobState.SuccessExited, lastD);
		} else if (this.isFailling()) {
			if (this.isFatalError()) {
				// nothing
			} else {
				this.setState(JobState.ErrorExited, this.getLastError() || new Error('impossible'));
			}
		}
	}

	get [pause]() {
		return getPauseControl(this.worker);
	}

	override async stop() {
		return this.worker.dispose();
	}

	override [inspect.custom](_d: number, options: InspectOptionsStylized, ins: typeof inspect) {
		return `${this.debugPrefix()} ${ins(this.worker, options).trim()}`;
	}
}

export enum ModeKind {
	Watch = 'watch',
	Build = 'build',
}

export class WorkersManager extends JobGraphBuilder<string, EventTranslate> {
	protected readonly _onTerminate = new Emitter<EventTranslate>();
	public readonly onTerminate = this._onTerminate.event;

	constructor(
		public readonly mode: ModeKind,
		private readonly _logger = createLogger('workers'),
	) {
		super(MAX_STARTING, _logger.extend('master'));
	}

	protected override getChildLogger(node: EventTranslate) {
		return this._logger.extend(node.name);
	}

	addWorker(worker: ProtocolClientObject, dependencies: readonly string[]) {
		const job = new EventTranslate(worker._id, dependencies, worker, this.mode);
		worker.onTerminate(() => {
			this._onTerminate.fireNoError(job);
		});
		this.addNode(job);
	}

	protected override _finalize() {
		const graph = super._finalize();
		// registerGlobalLifecycle(graph);
		// registerNodejsExitHandler();
		graph._register(this._onTerminate);
		return graph;
	}

	/**
	 * 进程退出的
	 */
	public get quitedWorkers() {
		return [...this.nodes].filter((worker) => !worker.isStopped()).map((e) => e.worker);
	}

	/**
	 * 正在编译的
	 */
	public get startingWorkers() {
		return [...this.nodes].filter((worker) => !worker.isRunning()).map((e) => e.worker);
	}

	/**
	 * 报告了错误但还在运行的
	 */
	public get recoverableFailedWorkers() {
		return [...this.nodes].filter((worker) => !worker.isFailling()).map((e) => e.worker);
	}

	/**
	 * 还没有开始的worker
	 */
	public get remainingWorkers() {
		return [...this.nodes].filter((worker) => !worker.isStarted()).map((e) => e.worker);
	}

	/**
	 * 运行失败且退出的worker
	 */
	public get unrecoverableWorkers() {
		return [...this.nodes].filter((worker) => !worker.isFatalError()).map((e) => e.worker);
	}

	public get _allWorkers() {
		return [...this.nodes].map((e) => e.worker);
	}

	// public formatDebugGraph(depth = Infinity) {
	// 	const dNum = this.startingWorkers.length + this.remainingWorkers.length;

	// 	return `[\x1B[38;5;14mWorkersManager\x1B[39m total=${this.workerList.length}; pending=${dNum}]\n` + this.graphBuilder.debugFormatGraph(depth) + '\n' + this.graphBuilder.debugFormatSummary();
	// }

	// public formatDebugList() {
	// 	const dNum = this.startingWorkers.length + this.remainingWorkers.length;

	// 	return `[\x1B[38;5;14mWorkersManager\x1B[39m total=${this.workerList.length}; pending=${dNum}]\n` + this.graphBuilder.debugFormatList() + '\n' + this.graphBuilder.debugFormatSummary();
	// }
}
