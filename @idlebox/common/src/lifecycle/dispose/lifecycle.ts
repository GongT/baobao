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

	readonly name?: string;
	readonly displayName?: string;

	// [Symbol.dispose]?(): void;
	/** @internal do not use/rely */
	// [Symbol.asyncDispose]?(): Promise<void>;
}

/** @public */
export interface IAsyncDisposable {
	dispose(): void | Promise<void>;

	name?: string;
	displayName?: string;

	// [Symbol.dispose]?(): void | Promise<void>;
	// [Symbol.asyncDispose]?(): void | Promise<void>;
}

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function toDisposable(fn_or_obj: Disposable | AsyncDisposable | (() => void)): IDisposable {
	if (typeof fn_or_obj === 'function') {
		return {
			get displayName() {
				return `toDisposable(${fn_or_obj.name || 'anonymous'})`;
			},
			dispose: fn_or_obj,
		};
	} else if (Symbol.dispose in fn_or_obj) {
		const obj = fn_or_obj as any;
		return {
			get displayName() {
				return `toDisposable[Disposable](${obj.displayName || obj.name || obj.constructor.name || 'unknown'})`;
			},
			dispose() {
				fn_or_obj[Symbol.dispose]();
			},
		};
	} else if (Symbol.asyncDispose in fn_or_obj) {
		const obj = fn_or_obj as any;
		return {
			get displayName() {
				return `toDisposable[AsyncDisposable](${obj.displayName || obj.name || obj.constructor.name || 'unknown'})`;
			},
			dispose() {
				return fn_or_obj[Symbol.asyncDispose]();
			},
		};
	} else {
		throw new TypeError('toDisposable: expected function or object with Symbol.dispose or Symbol.asyncDispose', {
			cause: fn_or_obj,
		});
	}
}
