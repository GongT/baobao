import { EventRegister } from '../event/event';

/**
 * @private
 */
export interface IDisposableEvents {
	onDisposeError: EventRegister<Error>;
	onBeforeDispose: EventRegister<void>;
	readonly hasDisposed: boolean;
}

/** @public */
export interface IDisposable {
	dispose(): void;
}

/** @public */
export interface IAsyncDisposable {
	dispose(): void | Promise<void>;
}

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function toDisposable(fn: () => void): IDisposable {
	return { dispose: fn };
}
