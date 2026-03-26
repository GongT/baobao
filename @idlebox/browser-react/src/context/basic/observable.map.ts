import { Emitter, EnhancedDisposable } from '@idlebox/common';
import { useEffect, useSyncExternalStore, type SetStateAction } from 'react';
import { toCleanup } from '../../helpers/dispose-to-cleanup.js';
import { isEventAction } from '../../helpers/typings.js';
import { useStableCallback } from '../../hook/dev-stable.js';

export type KeyType = string | symbol;

export class ObservableMap<T> extends EnhancedDisposable {
	private readonly map = new Map<KeyType, T>();
	private readonly _onAnyChange = this._register(new Emitter<KeyType>('observable-map:any'));
	readonly onAnyChange = this._onAnyChange.event;

	getFirst() {
		for (const item of this.map.values()) {
			return item;
		}
		return undefined;
	}

	set(key: KeyType, value: T) {
		if (this.map.get(key) === value) return;

		this.map.set(key, value);
		this._onAnyChange.fire(key);
	}

	delete(key: KeyType) {
		if (this.map.has(key)) {
			this.map.delete(key);
			this._onAnyChange.fire(key);
		}
	}

	/**
	 * 作为导致map改变的发起者
	 */
	useProvider(key: KeyType) {
		const r = useSyncExternalStore(
			(sub) => {
				return toCleanup(this.onAnyChange(sub));
			},
			() => {
				return this.map.get(key);
			},
		);
		useEffect(() => {
			return () => {
				this.delete(key);
			};
		}, []);

		const setter = useStableCallback(
			(value: SetStateAction<T | undefined>) => {
				return this.setter(key, value);
			},
			[key],
		);

		return [r, setter] as const;
	}

	private setter(key: KeyType, value: SetStateAction<T | undefined>) {
		let newValue: T | undefined;
		if (isEventAction(value)) {
			newValue = value(this.map.get(key));
		} else {
			newValue = value;
		}
		if (newValue === undefined) {
			this.delete(key);
		} else {
			this.set(key, newValue);
		}
	}

	/**
	 * 作为关注map变化的使用者
	 */
	useConsumer(): T | undefined {
		return useSyncExternalStore(
			(sub) => {
				return toCleanup(this.onAnyChange(sub));
			},
			() => {
				return this.getFirst();
			},
		);
	}
}
