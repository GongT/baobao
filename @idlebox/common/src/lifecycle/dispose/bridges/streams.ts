import { defineInspectMethod } from '../../../debugging/inspect.js';
import { objectName } from '../../../debugging/object-with-name.js';
import type { IAsyncDisposable } from '../disposable.js';

type ClosableAsync =
	| {
			closed?: boolean;
			close(): Promise<any>;
	  }
	| {
			closed?: boolean;
			close(cb: (e?: Error | null) => void): any;
	  };

/**
 * Convert "close()"-able object to disposable
 *
 * @public
 */
export function closableToDisposable<T extends ClosableAsync>(closable: T): IAsyncDisposable {
	const r = {
		get displayName() {
			return `closable(${objectName(closable) || 'unknown'})`;
		},
		async dispose(): Promise<void> {
			if (r.disposing) return;
			r.disposing = true;

			try {
				if (closable.closed) return;

				await new Promise<void>((resolve, reject) => {
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
			} finally {
				r.disposed = true;
			}
		},
		disposed: false,
		disposing: false,
	};
	return defineInspectMethod(r, (_depth, options) => {
		return options.stylize(`[ClosableDisposable ${objectName(closable) || 'unknown'}]`, 'special');
	});
}

type EndableAsync =
	| {
			ended?: boolean;
			end(): Promise<any>;
	  }
	| {
			ended?: boolean;
			end(cb: (e?: Error | null) => void): any;
	  };

/**
 * Convert "end()"-able object to disposable
 *
 * @public
 */
export function endableToDisposable<T extends EndableAsync>(endable: T): IAsyncDisposable {
	const r = {
		get displayName() {
			return `endable(${objectName(endable) || 'unknown'})`;
		},
		async dispose(): Promise<void> {
			if (r.disposing) return;
			r.disposing = true;

			try {
				if (endable.ended) return;

				await new Promise<void>((resolve, reject) => {
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
			} finally {
				r.disposed = true;
			}
		},
		disposed: false,
		disposing: false,
	};

	return defineInspectMethod(r, (_depth, options) => {
		return options.stylize(`[EndableDisposable ${objectName(endable) || 'unknown'}]`, 'special');
	});
}
