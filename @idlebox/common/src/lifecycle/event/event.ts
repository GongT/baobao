import { IDisposable } from '../dispose/lifecycle.js';

export interface EventHandler<T> {
	(data: T): void;
}

export interface EventRegister<T> {
	(callback: EventHandler<T>): IDisposable;
}

/**
 * 事件注册对象
 * @public
 */
export class Emitter<T> implements IDisposable {
	protected readonly _callbacks: EventHandler<T>[] = [];

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
		for (const callback of this._callbacks) {
			callback(data);
		}
	}

	/**
	 * 与 `fire()`相同，但是忽略任何错误，并且即便出错也继续执行全部callback
	 */
	public fireNoError(data: T) {
		for (const callback of this._callbacks) {
			try {
				callback(data);
			} catch (e) {
				console.error('Error ignored: ', e);
			}
		}
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
		this._callbacks.unshift(callback);
		return {
			dispose: () => {
				const index = this._callbacks.indexOf(callback);
				if (index !== -1) {
					this._callbacks.splice(index, 1);
				}
			},
		};
	}

	dispose() {
		this._callbacks.length = 0;
		this.fireNoError =
			this.fire =
			this.handle =
				() => {
					throw new Error('Event is disposed');
				};
	}
}
