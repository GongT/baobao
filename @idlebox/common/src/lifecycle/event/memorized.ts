import type { IDisposable } from '../dispose/disposable.js';
import { Emitter } from './event.js';
import type { EventHandler } from './type.js';

/**
 * 会记住上次fire的内容，并在每个新的handler注册时立即调用一次的Emitter
 * 显然，这会对fire的内容保留一个引用，可以调用forget()取消
 * @public
 */
export class MemorizedEmitter<T> extends Emitter<T> {
	private _memo?: { data: T };

	public override fire(data: T) {
		super.fire(data);
		this._memo = { data };
	}

	public override fireNoError(data: T) {
		super.fireNoError(data);
		this._memo = { data };
	}

	public override handle(callback: EventHandler<T>): IDisposable {
		if (this._memo) callback(this._memo.data);
		return super.handle(callback);
	}

	public override once(): never {
		throw new Error('once() is not supported for MemorizedEmitter');
	}

	public forget() {
		this._memo = undefined;
	}

	override dispose(): void {
		this.forget();
		super.dispose();
	}
}
