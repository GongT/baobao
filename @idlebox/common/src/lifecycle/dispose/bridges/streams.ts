import { objectName } from '../../../debugging/object-with-name.js';
import type { IAsyncDisposable } from '../disposable.js';

type ClosableAsync = {
	close(): Promise<any>;
	close(cb: (e?: Error) => void): void;
};

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function closableToDisposable<T extends ClosableAsync>(closable: T): IAsyncDisposable {
	const promised = closable.close.length === 0;

	return {
		get displayName() {
			return `closable(${objectName(closable) || 'unknown'})`;
		},
		dispose() {
			if (promised) {
				return closable.close();
			} else {
				return new Promise<void>((resolve, reject) => {
					return closable.close((error) => {
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
	end(cb: (e?: Error) => void): void;
};

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function endableToDisposable<T extends EndableAsync>(endable: T): IAsyncDisposable {
	const promised = endable.end.length === 0;

	return {
		get displayName() {
			return `endable(${objectName(endable) || 'unknown'})`;
		},
		dispose() {
			if (promised) {
				return endable.end();
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
