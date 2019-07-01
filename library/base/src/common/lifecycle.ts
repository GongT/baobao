import { singleton } from './classes/singleton';
import { Emitter } from './event';

export interface IDisposable {
	dispose(): void;
}

export interface IAsyncDisposable {
	dispose(): void | Promise<void>;
}

export class AsyncDisposable implements IAsyncDisposable {
	private readonly _disposables: IAsyncDisposable[] = [];
	private readonly _onError = new Emitter<Error>();
	public readonly onError = this._onError.register;

	public _register<T extends IAsyncDisposable>(d: T): T {
		this._disposables.unshift(d);
		return d;
	}

	public async dispose() {
		for (const cb of this._disposables) {
			try {
				await cb.dispose();
			} catch (e) {
				debugger;
				this._onError.fire(e);
			}
		}
	}
}

export class Disposable {
	private readonly _disposables = new Set<IDisposable>();

	public _register<T extends IDisposable>(d: T): T {
		this._disposables.add(d);
		return d;
	}

	public dispose() {
		for (const item of this._disposables.values()) {
			item.dispose();
		}
	}
}

export function toDisposable(fn: () => void): IDisposable {
	return { dispose: fn };
}

@singleton
export abstract class LifecycleObject extends AsyncDisposable {
	protected doRegisterCleanup() {}

	protected done() {}
}
