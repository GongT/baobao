import { CancellationTokenSource, convertCaughtError, objectName, prettyFormatStack, raceTimeout, type CancellationToken } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { CSI } from '@idlebox/terminal-control/constants';
import strict from 'node:assert/strict';
import { inspect } from 'node:util';
import { AbstractBaseNode } from './base-graph.js';
import { JobState, UnrecoverableJobError } from './job-graph.lib.js';
import { getPauseControl } from './pause-interface.js';

export abstract class Job<AttachT> extends AbstractBaseNode<JobState> {
	protected override _dependencies: Set<string>;
	private _last_attach?: AttachT | Error;
	private _process?: Promise<any>;
	private readonly cancelSource = new CancellationTokenSource();

	constructor(name: string, dependencies: readonly string[], logger?: IMyLogger) {
		super(name, JobState.NotStarted, logger);
		this._dependencies = new Set(dependencies);
		if (this.stop !== Job.prototype.stop) {
			throw new Error(`stop method must not be overridden`);
		}
	}

	protected get processPromise() {
		return this._process;
	}

	protected get abortSignal(): AbortSignal {
		return this.cancelSource.token.abort;
	}
	protected get cancelToken(): CancellationToken {
		return this.cancelSource.token;
	}

	isStopped(): boolean {
		return this._state === JobState.SuccessExited || this._state === JobState.ErrorExited;
	}
	isStarted(): boolean {
		return this._state !== JobState.NotStarted;
	}
	isBlocking(): boolean {
		return this._state !== JobState.Success && this._state !== JobState.SuccessExited;
	}
	isFailling(): boolean {
		return this._state === JobState.Error || this._state === JobState.ErrorExited;
	}
	isFatalError() {
		return this._last_attach instanceof UnrecoverableJobError || this._state === JobState.ErrorExited;
	}
	isSuccess() {
		return this._state === JobState.Success || this._state === JobState.SuccessExited;
	}
	isRunning() {
		return this._state === JobState.Running;
	}

	override get stateName() {
		return this._state;
	}

	getLastError() {
		if (this.isFailling()) {
			return this._last_attach as Error;
		}
		return undefined;
	}

	getLastData() {
		if (this.isSuccess()) {
			return this._last_attach as AttachT;
		}
		return undefined;
	}

	protected override setState(state: JobState.Error | JobState.ErrorExited, attach: Error): void;
	protected override setState(state: JobState.Success | JobState.SuccessExited, attach: AttachT): void;
	protected override setState(state: JobState.NotStarted | JobState.Running): void;
	protected override setState(state: JobState, attach?: AttachT | Error): void {
		if (state === JobState.Error || state === JobState.ErrorExited) {
			if (!(attach instanceof Error)) {
				this.logger.fatal`Job ${this.name} setState(failed), but not attach an Error object (${typeof attach}| ${attach})`;
			}
			if (this.isFatalError()) {
				throw new Error(`can not move state after fatal error`);
			}
		} else {
			if (attach instanceof Error) {
				this.logger.fatal`Job ${this.name} setState(success), but attaching an Error object (${attach})`;
			}
		}

		this._last_attach = attach;
		super.setState(state);
	}

	protected abstract _execute(cancel: CancellationToken): Promise<AttachT | undefined | void>;

	async execute() {
		this.cancelSource.token.throwIfCanceled();

		if (this._state !== JobState.NotStarted) throw new Error(`Job ${this.name} already (state=${this._state})`);
		this.setState(JobState.Running);

		try {
			this._process = Promise.try(() => {
				return this._execute(this.cancelSource.token);
			});
			const r = await this._process;

			// @ts-expect-error: TS2367 _execute() may modify _state
			if (this._state === JobState.Running) {
				this.setState(JobState.SuccessExited, r as AttachT);
			} else {
				this.publishStateEvent();
			}
		} catch (ee: unknown) {
			const e = convertCaughtError(ee);
			if (e.stack) {
				this.logger.error`任务执行 _execute() 时抛出错误:\nlong<${prettyFormatStack(e.stack.split('\n')).join('\n')}>`;
			} else {
				this.logger.error`任务执行 _execute() 时抛出错误(无栈信息): long<${e.message}>`;
			}
			this.setState(JobState.ErrorExited, e);
		}
	}

	async join() {
		if (!this.isStarted() || this.isStopped()) {
			this.logger.verbose`join: 尚未启动，无需等待`;
			return;
		}
		await new Promise<void>((resolve) => {
			this.logger.verbose`join: 等待中...`;
			this.onStateChange(() => {
				this.logger.verbose`join: ${this._state} = ${this.isStopped()}...`;
				if (this.isStopped()) {
					resolve();
				}
			});
		});
	}

	/**
	 * 停止作业的抽象方法，由子类实现具体的停止逻辑
	 * 在cancelSource被取消前触发
	 */
	protected abstract _stop(): Promise<void>;

	async stop(): Promise<void> {
		if (!this.isStarted()) return;
		if (this.isStopped()) return;
		strict.ok(this.processPromise, 'isStarted()==true 时 processPromise 应该存在');

		const stopCall = this._stop();
		this.cancelSource.cancel();

		try {
			await raceTimeout(5000, Promise.allSettled([this.processPromise, stopCall]));
		} catch {
			throw new Error(`无法在 5000 毫秒内停止作业: ${objectName(this)}`);
		}
	}

	override async dispose(): Promise<void> {
		await this.stop();
		await this.join();
		return super.dispose();
	}

	//////////////////////////////

	public override translateState(): string {
		switch (this._state) {
			case JobState.NotStarted:
				return '未启动';
			case JobState.Running:
				return '正常运行';
			case JobState.Error:
				return '暂时错误';
			case JobState.Success:
				return '暂时成功';
			case JobState.ErrorExited:
				return '错误退出';
			case JobState.SuccessExited:
				return '成功退出';
			default:
				return '*未知状态*';
		}
	}
	protected override debugPrefix() {
		const pause = getPauseControl(this);
		let p = '';
		if (pause) {
			if (pause.isPaused()) {
				p = `${CSI}38;5;11m⏸︎${CSI}0m`;
			} else {
				p = `⏵︎`;
			}
		}
		if (this.isFatalError()) {
			p = `${CSI}38;5;11m✗${CSI}0m`;
		}
		switch (this._state) {
			case JobState.Running:
				return `${p}${CSI}38;5;14m●${CSI}0m`;
			case JobState.Success:
			case JobState.SuccessExited:
				return `${p}${CSI}38;5;10m●${CSI}0m`;
			case JobState.Error:
			case JobState.ErrorExited:
				return `${p}${CSI}38;5;9m●${CSI}0m`;
			default:
				return `${p}○${CSI}0m`;
		}
	}

	// override [inspect.custom]() {
	// 	return `[Job ${this.name}]`;
	// }
}

export class EmptyJob extends Job<any> {
	constructor(name: string) {
		super(name, []);
	}

	override isBlocking(): boolean {
		return true;
	}

	protected override _execute(): Promise<any> {
		return Promise.reject(new Error('试图启动空任务对象'));
	}

	protected override _stop(): Promise<void> {
		return Promise.resolve();
	}

	override [inspect.custom]() {
		return `[EmptyJob ${this.name}]`;
	}
}
