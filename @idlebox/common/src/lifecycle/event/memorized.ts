import { IDisposable } from '../dispose/lifecycle.js';
import { Emitter, EventHandler } from './event.js';

/**
 * 会记住上次fire的内容，并在每个新的handler注册时立即调用一次的Emitter
 * 显然，这会对fire的内容保留一个引用，可以调用forget()取消
 * @public
 */
export class MemorizedEmitter<T> extends Emitter<T> {
	private _memo?: T;
	private _is_memo: boolean = false;

	public override fire(data: T) {
		this._memo = data;
		this._is_memo = true;
		return super.fire(data);
	}

	public override fireNoError(data: T) {
		this._memo = data;
		this._is_memo = true;
		return super.fireNoError(data);
	}

	public override handle(callback: EventHandler<T>): IDisposable {
		if (this._is_memo) callback(this._memo!);
		return super.handle(callback);
	}

	public forget() {
		delete this._memo;
		this._is_memo = false;
	}

	override dispose(): void {
		this.forget();
		super.dispose();
	}
}
