import { Emitter } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { CSI } from '@idlebox/terminal-control/constants';
import { inspect, type InspectContext } from 'node:util';
import { CompileError } from './error.js';

export enum WorkerClientState {
	// 其他
	INVALID = -1,
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
	private _state = WorkerClientState.NOT_EXECUTE;
	private _backend_running = false;
	private readonly _times: Timings = {};
	protected last_event_message = '';

	protected readonly timings: Readonly<Timings> = this._times;

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
		this.logger = logger ?? createLogger(`mpis:protocol:server:${_id}`);

		if (_id.includes(' ')) {
			this.logger.warn(`标题包含空格`);
		}
	}

	protected emitSuccess(message: string, output?: string) {
		if (this._onSuccess.disposed) {
			this.logger.debug`emitSuccess在stop之后被调用，忽略`;
			return;
		}
		this.last_event_message = message;
		this.logger.success`built: ${message}\n`;
		this._times.lastCompile = Date.now();
		this._state = WorkerClientState.COMPILE_SUCCEED;
		this._onSuccess.fireNoError({ message, output });
		// this._onFinally.fireNoError();
	}

	protected emitFailure(message: Error): void;
	protected emitFailure(message: string, output?: string): void;
	protected emitFailure(e: string | Error, output?: string) {
		if (this._onFailure.disposed) {
			this.logger.warn`emitFailure在stop之后被调用，忽略`;
			if (e instanceof Error) {
				this.logger.debug`错误对象: ${e}`;
				if (output) this.logger.debug`文本输出: ${output}`;
			} else {
				this.logger.debug`文本输出: ${e}`;
			}
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
		this.logger.error`<触发>错误: [${e.name}] long<${e.message}>`;
		this.last_event_message = e.message;
		this._times.lastCompile = Date.now();
		this._state = WorkerClientState.COMPILE_FAILED;
		this._onFailure.fireNoError(e);
		// this._onFinally.fireNoError();
	}

	protected emitStart() {
		if (this._onStart.disposed) {
			this.logger.warn`emitStart在stop之后被调用，忽略`;
			return;
		}

		if (this._state === WorkerClientState.EXECUTING) {
			this._times.firstStart = Date.now();
		}
		this.logger.debug`<触发>启动`;
		this.last_event_message = '';
		this._state = WorkerClientState.COMPILE_STARTED;
		this._onStart.fireNoError();
	}

	public get time(): Readonly<Timings> {
		return this._times;
	}

	get state() {
		return this._state;
	}

	get isSuccess() {
		return this._state === WorkerClientState.COMPILE_SUCCEED;
	}

	get isFail() {
		return this._state === WorkerClientState.COMPILE_FAILED;
	}

	get isInvalid() {
		return this._state === WorkerClientState.INVALID;
	}

	/**
	 * 执行逻辑
	 * 不会抛出异常
	 */
	public async execute() {
		if (this._state !== WorkerClientState.NOT_EXECUTE) {
			this.logger.fatal` ! 工作线程重复启动`;
			return;
		}

		this._times.executeStart = Date.now();
		this.logger.debug`[exec] 开始`;
		this._backend_running = true;
		this._state = WorkerClientState.EXECUTING;

		try {
			await this._execute();
			this.logger.debug`[exec] _execute()正常返回`;
		} catch (e: any) {
			this.logger.error`[exec] _execute()抛出异常: ${e.message}`;
			this.emitFailure(e);
		} finally {
			this._times.executeEnd = Date.now();
			this._backend_running = false;

			if (this.state !== WorkerClientState.COMPILE_FAILED && this.state !== WorkerClientState.COMPILE_SUCCEED) {
				this.logger.verbose`[exec] 结束时状态异常，触发成功事件`;
				this.emitSuccess('构建结束，没有产生错误');
			}

			this._onTerminate.fireNoError();
			this._onTerminate.dispose();
			this.logger.debug`[exec] 返回`;
		}
	}

	/**
	 * 工作进程是否运行中
	 */
	get backendRunning() {
		return this._backend_running;
	}

	/** @deprecated */
	get running() {
		return this._backend_running;
	}

	protected [inspect.custom](depth: number, options: InspectContext) {
		return `${this._inspectDesc(options)} ${this._inspect(depth, options)}`;
	}

	protected _inspect(_depth: number, options: InspectContext) {
		if (!this.last_event_message) return '';

		let colorS = ' ';
		let colorE = ' ';
		if (options.colors) {
			colorE = `${CSI}0m`;
			if (this._state === WorkerClientState.COMPILE_SUCCEED) {
				colorS = `${CSI}38;5;10m`;
			} else {
				colorS = `${CSI}38;5;9m`;
			}
		}
		return `{${colorS}${this.last_event_message}${colorE}}`;
	}

	protected _inspectDesc(options: InspectContext) {
		return `[${options.stylize(this._id, 'special')}] ${CSI}2;3m(${WorkerClientState[this.state]})${CSI}0m`;
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

		// this._onTerminate.dispose(); -- execute退出时finally
	}

	private _disposed = false;
	public get disposed() {
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
