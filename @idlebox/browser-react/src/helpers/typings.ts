import type { SetStateAction } from 'react';

export type WithKey<T> = T & { key: React.Key };
export function isEventAction<T>(e: SetStateAction<T>): e is (prev: T) => T {
	return typeof e === 'function';
}
