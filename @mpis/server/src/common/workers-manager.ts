import { DeferredPromise, Disposable, Emitter, registerGlobalLifecycle } from '@idlebox/common';
import { createLogger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { DependencyGraph } from './dependency-graph.js';
import { State, type ProtocolClientObject } from './protocol-client-object.js';

const MAX_STARTING = 4;

export enum ExecuteState {
	/**
	 * 有叶子节点可以开始（或已经开始还没有结果）
	 */
	READY,
	/**
	 * 所有叶子节点都失败，但还在运行中
	 */
	HANG_MIDDLE,
	/**
	 * 有一些叶子节点失败且已经退出
	 */
	CAN_NOT_CONTINUE,
	/**
	 * manager的工作完成了
	 */
	COMPLETED,
}

class WorkersManager extends Disposable {
	private readonly workerList: ProtocolClientObject[] = [];
	private readonly dependencyGraph;
	private readonly logger;

	protected readonly _onTerminate = this._register(new Emitter<ProtocolClientObject>());
	public readonly onTerminate = this._onTerminate.event;

	private readonly dfd = new DeferredPromise<void, this>();

	constructor() {
		super(`WorkersManager`);

		const logger = createLogger('worker');
		this.logger = logger.extend('master');
		this.dependencyGraph = new DependencyGraph<ProtocolClientObject>(logger);

		registerGlobalLifecycle(this);
		registerNodejsExitHandler();
	}

	addWorker(worker: ProtocolClientObject, dependencies: ProtocolClientObject[]) {
		this._register(worker);

		this.workerList.push(worker);

		worker.onSuccess.once(() => {
			this.logger.debug`worker ${worker.title} success, continue start`;
			this.start_anything_else();
		});
		worker.onTerminate.once(() => {
			this.logger.debug`worker ${worker.title} terminated, continue start`;
			this.start_anything_else();
		});

		worker.onSuccess(() => {
			this.dependencyGraph.setStatus(worker.title, true);
		});
		worker.onFailure(() => {
			this.dependencyGraph.setStatus(worker.title, false);
		});
		worker.onTerminate(() => {
			this._onTerminate.fireNoError(worker);
		});

		this.dependencyGraph.addNode(
			worker.title,
			dependencies.map((e) => e.title),
			worker,
		);
	}

	async finalize() {
		Object.freeze(this.workerList);
		this.dependencyGraph.finalize();

		/*
		worker.onStart(() => {
			// 对于已经编译成功的worker，当start时，设为失败状态
			if (this.dependencyGraph.getStatus(worker.title)) {
				this.dependencyGraph.setStatus(worker.title, false);
			}
		});
		*/

		this.start_anything_else();
		await this.dfd.p;

		this.logger.debug`all workers started!!!`;
	}

	private start_anything_else() {
		if (this.hasDisposed) return;

		if (this.unrecoverableWorkers.length) {
			this.logger.error`unrecoverable workers detected, can not continue.`;
			this.dfd.error(new Error('unrecoverable workers detected'));
			return;
		}

		const remaining = this.remainingWorkers;
		if (remaining.length === 0) {
			this.logger.debug`no more workers to start, all are started!`;
			this.dfd.complete();
			return;
		}

		const starting = this.startingWorkers.length;
		const emptySlots = MAX_STARTING - starting;
		this.logger.debug`${emptySlots} slots, ${starting} already starting.`;
		if (emptySlots <= 0) {
			return;
		}

		this.logger.debug`total ${remaining.length} remaining workers...`;

		const leafs = this.dependencyGraph.getNotInitializedLeaf(emptySlots);
		this.logger.debug`starting ${leafs.length} of them.`;

		this.dfd.notify(this);

		if (this.hasDisposed) {
			this.logger.verbose`disposed during notify.`;
			return;
		}

		for (const worker of leafs) {
			this.logger.verbose`  ++ ${worker.title}`;
			this.dependencyGraph.setInitialized(worker.title);
			worker.execute();
		}
	}

	public detectExecuteState(): ExecuteState {
		if (this.unrecoverableWorkers.length > 0) {
			return ExecuteState.CAN_NOT_CONTINUE;
		}
		if (this.dfd.completed) {
			return ExecuteState.COMPLETED;
		}
		if (this.startingWorkers.length) {
			return ExecuteState.READY;
		}
		const leafs = this.dependencyGraph.getNotInitializedLeaf(1);
		if (leafs.length > 0) {
			return ExecuteState.READY;
		}
		return ExecuteState.HANG_MIDDLE;
	}

	public get size() {
		return this.dependencyGraph.size;
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

	public formatDebugGraph() {
		const dNum = this.startingWorkers.length + this.remainingWorkers.length;

		return (
			`[\x1B[38;5;14mWorkersManager\x1B[39m total=${this.workerList.length}; pending=${dNum}]\n` +
			this.dependencyGraph.debugFormatGraph() +
			'\n' +
			this.dependencyGraph.debugSummary()
		);
	}
}

export const workersManager = new WorkersManager();
