import type { ILocalStorage } from '@idlebox/browser';
import { useEventRefresh } from './use-emitter.js';

export function useLocalStorage<T>(storage: ILocalStorage<T>) {
	useEventRefresh(storage.onChange);
	return storage.data;
}
