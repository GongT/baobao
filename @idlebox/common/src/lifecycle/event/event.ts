import { IDisposable } from '../dispose/lifecycle.js';

export interface EventHandler<T> {
	(data: T): void;
}

export interface EventRegister<T> {
	(callback: EventHandler<T>): IDisposable;
}

type DeferFn = () => void;

/**
 * 事件注册对象
 * @public
 */
export class Emitter<T> implements IDisposable {
	protected readonly _callbacks: EventHandler<T>[] = [];
	private executing: boolean = false;

	constructor() {
		this.handle = this.handle.bind(this);
	}

	/**
	 * @returns 当前注册回调数量
	 */
	public listenerCount() {
		return this._callbacks.length;
	}

	/**
	 * 触发本事件
	 * @param data 回调数据
	 */
	public fire(data: T) {
		this.requireNotExecuting();
		this.executing = true;
		try {
			for (const callback of this._callbacks) {
				callback(data);
			}
		} finally {
			this.doDefer();
			this.executing = false;
		}
	}

	/**
	 * 与 `fire()`相同，但是忽略任何错误，并且即便出错也继续执行全部callback
	 */
	public fireNoError(data: T) {
		this.requireNotExecuting();
		this.executing = true;
		for (const callback of this._callbacks) {
			try {
				callback(data);
			} catch (e) {
				console.error('Error ignored: ', e);
			}
		}
		this.doDefer();
		this.executing = false;
	}

	/**
	 * 获取handle()方法的引用
	 */
	get register(): EventRegister<T> {
		return this.handle;
	}

	/**
	 * 注册本事件的新回调
	 * @param callback 回调函数
	 */
	handle(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();
		let disposed = false;
		this._callbacks.unshift((e) => {
			if (!disposed) callback(e);
		});
		const realDispose = () => {
			const index = this._callbacks.indexOf(callback);
			if (index !== -1) {
				this._callbacks.splice(index, 1);
			}
		};
		return {
			dispose: () => {
				disposed = true;
				if (this.executing) {
					this.defer(realDispose);
				} else {
					realDispose();
				}
			},
		};
	}

	/**
	 * 注册一次性回调
	 * @param callback 回调函数
	 */
	once(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();
		const disposable = this.handle((data) => {
			callback(data);
			disposable.dispose();
		});
		return disposable;
	}

	private defers: DeferFn[] = [];
	public defer(fn: DeferFn) {
		this.defers.push(fn);
	}
	private doDefer() {
		for (const fn of this.defers) {
			fn();
		}
		this.defers.length = 0;
	}

	dispose() {
		this.requireNotExecuting();
		this._callbacks.length = 0;
		this.fireNoError =
			this.fire =
			this.handle =
				() => {
					throw new Error('Event is disposed');
				};
	}

	private requireNotExecuting() {
		if (this.executing) {
			throw new Error('conflict state, emitter is firing');
		}
	}
}
