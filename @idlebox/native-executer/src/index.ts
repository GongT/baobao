import type {} from './types.ts';

export function getLoadedFiles(): IterableIterator<string> {
	const sets = __ts_resolver_installed__.files;
	if (sets) {
		return sets.values();
	}
	throw new Error('feature not loaded');
}
