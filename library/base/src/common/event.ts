import { IDisposable } from './lifecycle';

export interface EventHandler<T> {
	(data: T): void;
}

export interface EventRegister<T> {
	(callback: EventHandler<T>): IDisposable;
}

export class Emitter<T> implements IDisposable {
	private readonly _callbacks: EventHandler<T>[] = [];

	constructor() {
		this.handle = this.handle.bind(this);
	}

	fire(data: T) {
		for (const callback of this._callbacks) {
			callback(data);
		}
	}

	get register(): EventRegister<T> {
		return this.handle;
	}

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
		this.fire = this.handle = () => {
			throw new Error('Event is disposed');
		};
	}
}
