import { AsyncDisposable, Emitter } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { inspect } from 'node:util';

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

export abstract class ProtocolClientObject extends AsyncDisposable {
	protected readonly logger: IMyLogger;
	private _state = State.NOT_EXECUTE;
	private _running = false;

	private readonly _onStart = this._register(new Emitter<void>());
	/**
	 * 编译开始时反复触发
	 */
	public readonly onStart = this._onStart.event;

	private readonly _onSuccess = this._register(new Emitter<void>());
	/**
	 * 编译成功时反复触发
	 */
	public readonly onSuccess = this._onSuccess.event;

	private readonly _onFailure = this._register(new Emitter<Error>());
	/**
	 * 编译出错时反复触发
	 */
	public readonly onFailure = this._onFailure.event;

	private readonly _onTerminate = this._register(new Emitter<void>());
	/**
	 * 子线程退出后触发一次
	 */
	public readonly onTerminate = this._onTerminate.event;

	constructor(public readonly title: string) {
		super(title);

		this.logger = createLogger(`protocol:${title}`);

		if (title.includes(' ')) {
			this.logger.warn(`title contains space`);
		}
	}

	protected emitSuccess() {
		this._state = State.COMPILE_SUCCEED;
		this._onSuccess.fireNoError();
	}

	protected emitFailure(e: Error) {
		this._state = State.COMPILE_FAILED;
		this._onFailure.fireNoError(e);
	}

	protected emitStart() {
		this._state = State.COMPILE_STARTED;
		this._onStart.fireNoError();
	}

	// private _throw_not_init() {
	// 	this.logger.error`want to fire event, but worker not executed.`;
	// }

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
			this._running = false;

			if (this.state !== State.COMPILE_FAILED && this.state !== State.COMPILE_SUCCEED) {
				this.logger.verbose` ~ unknown state, emitting success`;
				this.emitSuccess();
			}

			if (this.hasDisposed) {
				this.logger.verbose` ~ disposed, not firing events other than terminate`;
			} else {
				this._onTerminate.fireNoError();
				this.logger.debug` ~ worker _execute() ending`;
			}
		}
	}

	get running() {
		return this._running;
	}

	protected [inspect.custom]() {
		return this._inspect();
	}

	protected _inspect() {
		return `[Worker ${State[this.state]} (${this._running ? 'running' : 'stopped'}) ${this.title}]`;
	}

	/**
	 * 工作内容，watch不能返回，要停止后再resolve
	 * 出现无法继续的错误则reject（例如进程异常退出）
	 */
	protected abstract _execute(): Promise<void>;
}
