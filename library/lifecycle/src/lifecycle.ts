import { EventRegister } from './event';

export interface IDisposableBaseInternal {
	onDisposeError: EventRegister<Error>;
	onBeforeDispose: EventRegister<void>;
	readonly hasDisposed: boolean;
}

export interface IDisposable {
	dispose(): void;
}

export interface IAsyncDisposable {
	dispose(): void | Promise<void>;
}

export function toDisposable(fn: () => void): IDisposable {
	return { dispose: fn };
}
