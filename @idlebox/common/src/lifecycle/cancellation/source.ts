import { CanceledError } from '@idlebox/errors';
import { createDuplicateCallTracer } from '../../debugging/duplicate_call.js';
import { convertLog, debugLogger, type IAcceptLogger, type ILowLogger } from '../../debugging/logging.js';
import { functionName } from '../../debugging/object-with-name.js';
import type { IDisposable } from '../dispose/disposable.js';
import type { EventHandler } from '../event/type.js';

/** @public */
export interface CancellationToken {
	/**
	 * 表示是否已经请求取消。
	 */
	readonly isCancellationRequested: boolean;
	/**
	 * 如果取消请求已经发生，该属性将包含取消的原因。
	 */
	readonly canceledReason?: Error;
	/**
	 * 注册取消请求的回调函数。
	 */
	onCancellationRequested(callback: EventHandler<Error>): IDisposable;
	/**
	 * 返回一个Promise，在取消请求发生时reject，调用fullfilled() 时resolve。
	 * 注意: 如果没有调用fullfilled()，该Promise不会resolve，需要双方配合使用。
	 */
	readonly promise: Promise<void>;
	/**
	 * 如果取消请求已经发生，该方法将抛出一个 CanceledError。否则什么都不做。
	 *
	 * @param what 如果提供，将在取消时抛出该错误，而不是默认的 CanceledError。
	 */
	throwIfCanceled(what?: Error): void;

	/**
	 * 获取底层的 AbortSignal。
	 */
	readonly abort: AbortSignal;
}

/**
 * @internal
 */
export class CancellationTokenImpl implements CancellationToken {
	private readonly disposable = new AbortController();

	constructor(
		public readonly abort: AbortSignal,
		private readonly logger: ILowLogger = debugLogger('cancellation:token'),
	) {}

	public get isCancellationRequested() {
		return this.abort.aborted;
	}

	public get canceledReason() {
		return this.abort.reason;
	}

	onCancellationRequested(listener: EventHandler<Error>) {
		if (this.logger.isEnabled) this.logger`注册取消请求回调: ${functionName(listener)}`;
		const handler = () => listener(this.abort.reason);
		this.abort.addEventListener('abort', handler, { signal: this.disposable.signal });

		return {
			dispose: () => {
				this.abort.removeEventListener('abort', handler);
			},
		};
	}

	throwIfCanceled(what?: Error) {
		// 不使用原版，用 CanceledError 代替
		if (this.logger.isEnabled) this.logger`检查取消状态: ${this.abort.aborted}`;
		if (this.abort.aborted) {
			if (what) {
				throw what;
			}
			throw new CanceledError({ cause: this.abort.reason });
		}
	}

	get promise() {
		if (this.abort.aborted) {
			return Promise.reject(this.abort.reason);
		}
		return new Promise<void>((resolve, reject) => {
			const handler = () => reject(this.abort.reason);
			this.abort.addEventListener('abort', handler);
			this.disposable.signal.addEventListener('abort', () => resolve());
		});
	}

	[Symbol.dispose](): void {
		if (this.logger.isEnabled) this.logger`释放 Token`;
		this.disposable.abort();
	}

	dispose() {
		if (this.logger.isEnabled) this.logger`释放 Token`;
		this.disposable.abort();
	}
}

interface IOptions {
	readonly debugMode?: boolean;
	readonly driver?: AbortController;
	readonly logger?: IAcceptLogger;
}

/** @public */
export class CancellationTokenSource implements IDisposable {
	private readonly _token: CancellationTokenImpl;
	public readonly token: CancellationToken;

	private fullfilledFlag;
	private canceledFlag;

	public readonly displayName: string;
	private readonly driver: AbortController;
	private readonly logger: ILowLogger;

	constructor({ debugMode = false, driver = new AbortController(), logger }: IOptions = {}) {
		this.driver = driver;
		this.logger = logger ? convertLog(logger) : debugLogger('cancellation:token');
		this.displayName = `CancellationTokenSource`;

		this.fullfilledFlag = createDuplicateCallTracer(debugMode);
		this.canceledFlag = createDuplicateCallTracer(debugMode);
		this._token = new CancellationTokenImpl(driver.signal, this.logger);
		this.token = this._token;
	}

	/**
	 * 请求取消当前令牌
	 * 如果当前令牌已经被标记为已完成或已经取消，将抛出 DuplicateCallError。
	 */
	cancel(reason: Error = new CanceledError()): void {
		if (this.logger.isEnabled) this.logger`取消: ${reason?.message ?? '没有提供reason'}`;
		this.fullfilledFlag.never();
		this.canceledFlag.assert();
		this.driver.abort(reason);
		this.dispose();
	}

	/**
	 * 标记当前取消令牌为已完成，resolve 其 promise。
	 * 如果当前令牌已经被标记为已完成或已经取消，将抛出 DuplicateCallError。
	 */
	fullfilled(): void {
		if (this.logger.isEnabled) this.logger`标记为已完成`;
		this.canceledFlag.never();
		this.fullfilledFlag.assert();
		Object.assign(this, { driver: null });
		this.dispose();
	}

	private disposed = false;
	dispose(): void {
		if (this.logger.isEnabled) this.logger`释放 TokenSource`;
		if (this.disposed) return;
		this.disposed = true;

		if (!this.fullfilledFlag.test() && !this.canceledFlag.test()) {
			this.cancel(new CanceledError());
		}
		this._token.dispose();
	}
}
