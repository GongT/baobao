import { Emitter } from '@idlebox/common';
import { createLogger, CSI, type IMyLogger } from '@idlebox/logger';
import { inspect, type InspectOptionsStylized } from 'node:util';
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

/**
 * 编译事件源
 */
export abstract class ProtocolClientObject {
	protected readonly logger: IMyLogger;
	private _state = State.NOT_EXECUTE;
	private _running = false;
	private readonly timings: Timings = {};
	protected last_event_message = '';

	/**
	 * 编译开始时反复触发
	 */
	private readonly _onStart = new Emitter<void>();
	public readonly onStart = this._onStart.event;

	/**
	 * 编译成功时反复触发
	 */
	private readonly _onSuccess = new Emitter<SuccessEvent>();
	public readonly onSuccess = this._onSuccess.event;

	/**
	 * 编译出错时反复触发
	 */
	private readonly _onFailure = new Emitter<Error>();
	public readonly onFailure = this._onFailure.event;

	/**
	 * 子线程退出后触发一次
	 */
	private readonly _onTerminate = new Emitter<void>();
	public readonly onTerminate = this._onTerminate.event;

	constructor(
		public readonly _id: string,
		logger?: IMyLogger,
	) {
		this.logger = logger ?? createLogger(`protocol:${_id}`);

		if (_id.includes(' ')) {
			this.logger.warn(`title contains space`);
		}
	}

	protected emitSuccess(message: string, output?: string) {
		if (this._onSuccess.hasDisposed) {
			this.logger.debug`emitSuccess called after stop, ignoring`;
			return;
		}
		this.last_event_message = message;
		this.logger.success`built: ${message}\n`;
		this.timings.lastCompile = Date.now();
		this._state = State.COMPILE_SUCCEED;
		this._onSuccess.fireNoError({ message, output });
		// this._onFinally.fireNoError();
	}

	protected emitFailure(message: Error): void;
	protected emitFailure(message: string, output?: string): void;
	protected emitFailure(e: string | Error, output?: string) {
		if (this._onFailure.hasDisposed) {
			this.logger.warn`emitFailure called after stop, ignoring`;
			return;
		}

		if (e instanceof Error) {
			if (e instanceof CompileError) {
				//
			} else {
				const ee = new CompileError(e.message, output);
				ee.stack = `${ee.message}\n${e.stack?.slice(e.message.length + 1)}`;
				e = ee;
			}
		} else {
			e = new CompileError(e.toString(), output);
		}
		this.logger.error`failed: [${e.name}] long<${e.message}>`;
		this.last_event_message = e.message;
		this.timings.lastCompile = Date.now();
		this._state = State.COMPILE_FAILED;
		this._onFailure.fireNoError(e);
		// this._onFinally.fireNoError();
	}

	protected emitStart() {
		if (this._onStart.hasDisposed) {
			this.logger.warn`emitStart called after stop, ignoring`;
			return;
		}

		if (this._state === State.EXECUTING) {
			this.timings.firstStart = Date.now();
		}
		this.logger.debug`emit event: start building...`;
		this.last_event_message = '';
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

	/**
	 * 执行逻辑
	 * 不会抛出异常
	 */
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
				this.emitSuccess('build exited without error');
			}

			this._onTerminate.fireNoError();
			this.logger.debug` ~ worker _execute() ending`;
		}
	}

	get running() {
		return this._running;
	}

	protected [inspect.custom](depth: number, options: InspectOptionsStylized) {
		return this._inspectDesc(options) + ' ' + this._inspect(depth, options);
	}

	protected _inspect(_depth: number, options: InspectOptionsStylized) {
		if (!this.last_event_message) return '';

		let colorS = ' ';
		let colorE = ' ';
		if (options.colors) {
			colorE = `${CSI}0m`;
			if (this._state === State.COMPILE_SUCCEED) {
				colorS = `${CSI}38;5;10m`;
			} else {
				colorS = `${CSI}38;5;9m`;
			}
		}
		return `{${colorS}${this.last_event_message}${colorE}}`;
	}

	protected _inspectDesc(options: InspectOptionsStylized) {
		return `[${options.stylize(this._id, 'special')}] ${CSI}2;3m(${State[this.state]})${CSI}0m`;
	}

	protected abstract _stop(): Promise<void>;

	private stopped = false;
	async stop() {
		if (this.stopped) return;
		this.stopped = true;

		this._onStart.dispose();
		this._onSuccess.dispose();
		this._onFailure.dispose();

		await this._stop();

		this._onTerminate.dispose();
	}

	private _disposed = false;
	public get hasDisposed() {
		return this._disposed;
	}
	dispose() {
		if (this._disposed) return;
		this._disposed = true;
		return this.stop();
	}

	/**
	 * 工作内容，watch不能返回，要停止后再resolve
	 * 出现无法继续的错误则reject（例如进程异常退出）
	 */
	protected abstract _execute(): Promise<void>;
}
