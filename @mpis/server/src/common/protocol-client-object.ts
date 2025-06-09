import { AsyncDisposable, Emitter } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { inspect } from 'node:util';
import { CompileError } from './error.js';

export enum State {
	// 没有启动
	NOT_EXECUTE,
	// 启动了，但第一个start还没有发生
	EXECUTING,
	// 最近事件是start
	COMPILE_STARTED,
	// 最近事件是failure
	COMPILE_FAILED,
	// 最近事件是success
	COMPILE_SUCCEED,
}

type Timings = {
	executeStart?: number;
	executeEnd?: number;
	firstStart?: number;
	lastCompile?: number;
};

interface SuccessEvent {
	message: string;
	output?: string;
}

export abstract class ProtocolClientObject extends AsyncDisposable {
	protected readonly logger: IMyLogger;
	private _state = State.NOT_EXECUTE;
	private _running = false;
	private readonly timings: Timings = {};

	/**
	 * 编译开始时反复触发
	 */
	private readonly _onStart = this._register(new Emitter<void>());
	public readonly onStart = this._onStart.event;

	/**
	 * 编译成功时反复触发
	 */
	private readonly _onSuccess = this._register(new Emitter<SuccessEvent>());
	public readonly onSuccess = this._onSuccess.event;

	/**
	 * 编译出错时反复触发
	 */
	private readonly _onFailure = this._register(new Emitter<Error>());
	public readonly onFailure = this._onFailure.event;

	/**
	 * 编译结束时反复触发
	 */
	// private readonly _onFinally = this._register(new Emitter<void>());
	// public readonly onFinally = this._onFinally.event;

	/**
	 * 子线程退出后触发一次
	 */
	private readonly _onTerminate = this._register(new Emitter<void>());
	public readonly onTerminate = this._onTerminate.event;

	constructor(public readonly _id: string) {
		super(_id);

		this.logger = createLogger(`protocol:${_id}`);

		if (_id.includes(' ')) {
			this.logger.warn(`title contains space`);
		}
	}

	protected emitSuccess(message: string, output?: string) {
		this.timings.lastCompile = Date.now();
		this._state = State.COMPILE_SUCCEED;
		this._onSuccess.fireNoError({ message, output });
		// this._onFinally.fireNoError();
	}

	protected emitFailure(message: Error): void;
	protected emitFailure(message: string, output?: string): void;
	protected emitFailure(e: string | Error, output?: string) {
		if (e instanceof Error) {
			//
		} else {
			e = new CompileError(this._id, e, output);
		}
		this.timings.lastCompile = Date.now();
		this._state = State.COMPILE_FAILED;
		this._onFailure.fireNoError(e);
		// this._onFinally.fireNoError();
	}

	protected emitStart() {
		if (this._state === State.EXECUTING) {
			this.timings.firstStart = Date.now();
		}
		this._state = State.COMPILE_STARTED;
		this._onStart.fireNoError();
	}

	public get time(): Readonly<Timings> {
		return this.timings;
	}

	get state() {
		return this._state;
	}

	get isSuccess() {
		return this._state === State.COMPILE_SUCCEED;
	}

	public async execute() {
		if (this._state !== State.NOT_EXECUTE) {
			this.logger.fatal` ! worker already started`;
			return;
		}

		this.timings.executeStart = Date.now();
		this.logger.debug` ~ worker _execute()`;
		this._running = true;
		this._state = State.EXECUTING;

		try {
			await this._execute();
			this.logger.debug` ~ worker _execute() returned`;
		} catch (e: any) {
			this.logger.debug` ~ worker _execute() error: ${e.message}`;
			this.emitFailure(e);
		} finally {
			this.timings.executeEnd = Date.now();
			this._running = false;

			if (this.state !== State.COMPILE_FAILED && this.state !== State.COMPILE_SUCCEED) {
				this.logger.verbose` ~ unknown state, emitting success`;
				this.emitSuccess('build completed without error');
			}

			if (this.hasDisposed) {
				this.logger.verbose` ~ disposed, not firing events other than terminate`;
			} else {
				this._onTerminate.fireNoError();
			}
			this.logger.debug` ~ worker _execute() ending`;
		}
	}

	get running() {
		return this._running;
	}

	protected [inspect.custom]() {
		return this._inspect();
	}

	protected _inspect() {
		return `[Worker ${State[this.state]} (${this._running ? 'running' : 'stopped'}) ${this._id}]`;
	}

	/**
	 * 工作内容，watch不能返回，要停止后再resolve
	 * 出现无法继续的错误则reject（例如进程异常退出）
	 */
	protected abstract _execute(): Promise<void>;
}
