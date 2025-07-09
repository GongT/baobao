import { Disposable, Emitter, registerGlobalLifecycle } from '@idlebox/common';
import { BuilderDependencyGraph, WatcherDependencyGraph, type IWatchEvents } from '@idlebox/dependency-graph';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { inspect } from 'node:util';
import { State, type ProtocolClientObject } from './protocol-client-object.js';

const MAX_STARTING = 4;

class EventTranslate implements IWatchEvents {
	private readonly _onSuccess = new Emitter<void>();
	public readonly onSuccess = this._onSuccess.event;

	private readonly _onFailed = new Emitter<Error>();
	public readonly onFailed = this._onFailed.event;

	private readonly _onRunning = new Emitter<void>();
	public readonly onRunning = this._onRunning.event;

	constructor(
		protected readonly logger: IMyLogger,
		private readonly worker: ProtocolClientObject,
	) {
		worker.onStart(() => {
			this._onRunning.fireNoError();
		});
		worker.onSuccess(() => {
			this._onSuccess.fireNoError();
		});
		worker.onFailure((err) => {
			this._onFailed.fireNoError(err);
		});
	}

	async execute(): Promise<void> {
		await this.worker.execute();

		// this.worker.err
	}

	[inspect.custom]() {
		return this.worker._inspect();
	}
}

export enum ModeKind {
	Watch = 'watch',
	Build = 'build',
}

export class WorkersManager extends Disposable {
	private readonly workerList: ProtocolClientObject[] = [];
	private readonly dependencyGraph: WatcherDependencyGraph | BuilderDependencyGraph;
	private readonly logger;

	protected readonly _onTerminate = this._register(new Emitter<ProtocolClientObject>());
	public readonly onTerminate = this._onTerminate.event;

	constructor(
		public readonly mode: ModeKind,
		logger = createLogger('worker'),
	) {
		super(`WorkersManager`);

		this.logger = logger.extend('master');
		this.dependencyGraph =
			mode === ModeKind.Watch
				? new WatcherDependencyGraph(MAX_STARTING, this.logger)
				: new BuilderDependencyGraph(MAX_STARTING, this.logger);

		registerGlobalLifecycle(this);
		registerNodejsExitHandler();
	}

	addEmptyWorker(id: string) {
		this.dependencyGraph.addEmptyNode(id);
	}

	addWorker(worker: ProtocolClientObject, dependencies: readonly string[]) {
		this._register(worker);

		this.workerList.push(worker);

		this.dependencyGraph.addNode(worker._id, dependencies, new EventTranslate(this.logger, worker));
	}

	private _finalized = false;
	finalize() {
		if (this._finalized) return;
		this._finalized = true;
		Object.freeze(this.workerList);
		this.dependencyGraph.finalize();
		this.logger.debug`workers finalized.`;
	}

	async startup() {
		this.finalize();

		await this.dependencyGraph.startup();
		this.logger.debug`all workers started!!!`;
	}

	public get size() {
		return this.dependencyGraph.size();
	}

	/**
	 * 进程退出的
	 */
	public get quitedWorkers() {
		return this.workerList.filter((worker) => !worker.running);
	}

	/**
	 * 正在编译的
	 */
	public get startingWorkers() {
		return this.workerList.filter(
			(worker) => worker.state === State.EXECUTING || worker.state === State.COMPILE_STARTED,
		);
	}

	/**
	 * 报告了错误但还在运行的
	 */
	public get recoverableFailedWorkers() {
		return this.workerList.filter((worker) => worker.state === State.COMPILE_FAILED && worker.running);
	}

	/**
	 * 还没有开始的worker
	 */
	public get remainingWorkers() {
		return this.workerList.filter((worker) => worker.state === State.NOT_EXECUTE);
	}

	/**
	 * 运行失败且退出的worker
	 */
	public get unrecoverableWorkers() {
		return this.workerList.filter((worker) => worker.state === State.COMPILE_FAILED && !worker.running);
	}

	public get allWorkers() {
		return this.workerList;
	}

	public formatDebugGraph() {
		const dNum = this.startingWorkers.length + this.remainingWorkers.length;

		return (
			`[\x1B[38;5;14mWorkersManager\x1B[39m total=${this.workerList.length}; pending=${dNum}]\n` +
			this.dependencyGraph.debugFormatGraph() +
			'\n' +
			this.dependencyGraph.debugFormatSummary()
		);
	}

	public formatDebugList() {
		const dNum = this.startingWorkers.length + this.remainingWorkers.length;

		return (
			`[\x1B[38;5;14mWorkersManager\x1B[39m total=${this.workerList.length}; pending=${dNum}]\n` +
			this.dependencyGraph.debugFormatList() +
			'\n' +
			this.dependencyGraph.debugFormatSummary()
		);
	}
}
