import { defineInspectMethod } from '../../../debugging/inspect.js';
import { objectName } from '../../../debugging/object-with-name.js';
import type { IAsyncDisposable } from '../disposable.js';

type ClosableAsync =
	| {
			close(): Promise<any>;
	  }
	| {
			close(cb: (e?: Error) => void): any;
	  };

/**
 * Convert "close()"-able object to disposable
 * @public
 */
export function closableToDisposable<T extends ClosableAsync>(closable: T): IAsyncDisposable {
	return defineInspectMethod(
		{
			get displayName() {
				return `closable(${objectName(closable) || 'unknown'})`;
			},
			dispose(): Promise<void> {
				return new Promise<void>((resolve, reject) => {
					const mayPromise = closable.close((error) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
					if (typeof mayPromise?.then === 'function') {
						mayPromise.then(resolve, reject);
					}
				});
			},
		},
		(_depth, options) => {
			return options.stylize(`[ClosableDisposable ${objectName(closable) || 'unknown'}]`, 'special');
		},
	);
}

type EndableAsync =
	| {
			end(): Promise<any>;
	  }
	| {
			end(cb: (e?: Error) => void): any;
	  };

/**
 * Convert "end()"-able object to disposable
 * @public
 */
export function endableToDisposable<T extends EndableAsync>(endable: T): IAsyncDisposable {
	return defineInspectMethod(
		{
			get displayName() {
				return `endable(${objectName(endable) || 'unknown'})`;
			},
			dispose(): Promise<void> {
				return new Promise<void>((resolve, reject) => {
					const mayPromise = endable.end((error) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
					if (typeof mayPromise?.then === 'function') {
						mayPromise.then(resolve, reject);
					}
				});
			},
		},
		(_depth, options) => {
			return options.stylize(`[EndableDisposable ${objectName(endable) || 'unknown'}]`, 'special');
		},
	);
}
