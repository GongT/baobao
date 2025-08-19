import { Exit } from '@idlebox/errors';
import { nameObject, objectName } from '../../debugging/object-with-name.js';
import { createStackTraceHolder } from '../../error/stack-trace.js';
import { functionToDisposable } from '../dispose/bridges/function.js';
import { DuplicateDisposed } from '../dispose/disposedError.js';
import type { IDisposable } from '../dispose/disposable.js';
import type { EventHandler, EventRegister, IEventEmitter } from './type.js';

/**
 * @public
 */
export class Emitter<T = unknown> implements IEventEmitter<T> {
	protected _callbacks?: (EventHandler<T> | undefined)[];
	private executing = false;
	private _something_change_during_call = false;

	constructor(public readonly displayName?: string) {}

	public listenerCount() {
		return this._callbacks?.length ?? 0;
	}

	public fire(data: T) {
		this.requireNotExecuting();
		if (!this._callbacks) return;

		this.executing = true;
		try {
			for (const callback of this._callbacks) {
				callback?.(data);
			}
		} finally {
			this.executing = false;
			if (this._something_change_during_call) {
				this.checkDeleted();
			}
		}
	}

	public fireNoError(data: T) {
		this.requireNotExecuting();
		if (!this._callbacks) return;

		this.executing = true;
		for (const callback of this._callbacks) {
			try {
				callback?.(data);
			} catch (e) {
				if (e instanceof Exit) {
					break;
				}
				console.error('Emitter.fireNoError: error ignored: %s', e instanceof Error ? e.stack : e);
			}
		}
		this.executing = false;
		if (this._something_change_during_call) {
			this.checkDeleted();
		}
	}

	get register(): EventRegister<T> {
		return Object.assign(this.handle.bind(this), {
			once: this.once.bind(this),
			wait: this.wait.bind(this),
		});
	}

	get event(): EventRegister<T> {
		return this.register;
	}

	/**
	 * 添加监听器
	 */
	handle(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();

		if (!this._callbacks) this._callbacks = [];

		const callbacks = this._callbacks;
		callbacks.unshift(callback);

		return functionToDisposable(
			nameObject(`removeListener(${objectName(callback)})`, () => {
				const index = callbacks.indexOf(callback);
				if (index === -1) return;
				if (this.executing) {
					callbacks[index] = undefined;
				} else {
					callbacks.splice(index, 1);
				}
			}),
		);
	}

	/**
	 * 添加一次性监听器
	 */
	once(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();
		const disposable = this.handle((data) => {
			callback(data);
			disposable.dispose();
		});
		return disposable;
	}

	/**
	 * 创建一个等待下次触发的promise
	 */
	private _waittings?: Set<Function>;
	wait(): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!this._waittings) this._waittings = new Set<Function>();
			this._waittings.add(reject);
			this.once((data) => {
				resolve(data);
			});
		});
	}

	private checkDeleted() {
		if (!this._callbacks) return;

		for (let i = this._callbacks.length - 1; i >= 0; i--) {
			if (this._callbacks[i] === undefined) {
				this._callbacks.splice(i, 1);
			}
		}
	}

	private _disposed = false;
	public get hasDisposed() {
		return this._disposed;
	}

	/**
	 * 运行过程中可以dispose，本次运行仍然会继续到最后
	 * 但立即不能再次调用类似handle的方法
	 */
	dispose() {
		if (this._disposed) return;
		this._disposed = true;

		this._callbacks = undefined;

		if (this._waittings) {
			for (const rej of this._waittings) {
				rej(new Error('disposed'));
			}
		}

		this._waittings = undefined;

		const trace = createStackTraceHolder('disposed');
		this.requireNotExecuting =
			this.fireNoError =
			this.fire =
			this.handle =
				() => {
					throw new DuplicateDisposed(this, trace);
				};
	}

	readonly [Symbol.dispose] = this.dispose;

	private requireNotExecuting() {
		if (this.executing) {
			throw new Error('conflict state, emitter is firing');
		}
	}
}
