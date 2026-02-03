import { objectName } from '../../../debugging/object-with-name.js';
import type { IAsyncDisposable } from '../disposable.js';

type ClosableAsync = {
	close(): Promise<any>;
	close(cb: (e?: Error) => void): any;
};

/**
 * Convert "close()"-able object to disposable
 * @public
 */
export function closableToDisposable<T extends ClosableAsync>(closable: T): IAsyncDisposable {
	const promised = closable.close.length === 0;

	return {
		get displayName() {
			return `closable(${objectName(closable) || 'unknown'})`;
		},
		dispose(): Promise<void> {
			if (promised) {
				return Promise.resolve(closable.close()).then(() => undefined);
			} else {
				return new Promise<void>((resolve, reject) => {
					closable.close((error) => {
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

type EndableAsync = {
	end(): Promise<any>;
	end(cb: (e?: Error) => void): any;
};

/**
 * Convert "end()"-able object to disposable
 * @public
 */
export function endableToDisposable<T extends EndableAsync>(endable: T): IAsyncDisposable {
	const promised = endable.end.length === 0;

	return {
		get displayName() {
			return `endable(${objectName(endable) || 'unknown'})`;
		},
		dispose(): Promise<void> {
			if (promised) {
				return Promise.resolve(endable.end()).then(() => undefined);
			} else {
				return new Promise<void>((resolve, reject) => {
					return endable.end((error) => {
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
