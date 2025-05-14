import type { EventRegister } from '../event/event.js';

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

	name?: string;
	displayName?: string;
}

/** @public */
export interface IAsyncDisposable {
	dispose(): void | Promise<void>;

	name?: string;
	displayName?: string;
}

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function toDisposable(fn: () => void): IDisposable {
	return { dispose: fn };
}
