import type { MaybeNamed } from '../../function/functionName.js';
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
export interface IDisposable extends MaybeNamed {
	dispose(): void;

	// [Symbol.dispose]?(): void;
	/** @internal do not use/rely */
	// [Symbol.asyncDispose]?(): Promise<void>;
}

/** @public */
export interface IAsyncDisposable extends MaybeNamed {
	dispose(): void | Promise<void>;

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

type ClosableAsync = { close(): Promise<any> } & MaybeNamed;
type ClosableSync = { close(cb: (e?: Error) => void): void } & MaybeNamed;
export function closableToDisposable(closable: ClosableAsync | ClosableSync): IDisposable {
	const promised = closable.close.length === 0;

	return {
		get displayName() {
			return `closableToDisposable[AsyncDisposable](${closable.displayName || closable.name || closable.constructor.name || 'unknown'})`;
		},
		dispose() {
			if (promised) {
				return (closable as ClosableAsync).close();
			} else {
				return new Promise<void>((resolve, reject) => {
					return (closable as ClosableSync).close((error) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
				});
			}
		},
	};
}
