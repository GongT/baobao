import { Emitter, nameObject, type DeepReadonly } from '@idlebox/common';

export enum StorageKey {
	I18N = 'i18n',
	Development = '.development',
	UserSettings = 'user-settings',
}

const singletons = new Map<StorageKey, LocalStorage<any>>();
const buildRef = /*@__PURE__*/ window.addEventListener('storage', (ev) => {
	const instance = singletons.get(ev.key as StorageKey);
	if (!instance) {
		return;
	}

	instance.reload();
});

export type ILocalStorage<T> = LocalStorage<T>;

abstract class LocalStorage<Type> {
	declare readonly data: DeepReadonly<Type>;

	private readonly _onChange = new Emitter<DeepReadonly<Type>>();
	public readonly onChange = this._onChange.event;

	protected readonly __buildRef = buildRef;

	constructor(
		protected readonly key: StorageKey,
		private readonly defaultValue: DeepReadonly<Type>,
	) {
		const exists = singletons.get(key);
		if (exists) {
			// biome-ignore lint/correctness/noConstructorReturn: singleton
			return exists;
		}

		singletons.set(key, this);
		nameObject(`localstorage:${key}`, this._onChange);

		this.reload();
	}

	reload() {
		const str = localStorage.getItem(this.key);
		if (str) {
			try {
				this._data = this.parse(str);
				return;
			} catch {}
		}

		this._data = this.defaultValue;
	}

	set(value: Type) {
		const str = this.stringify(value);
		if (localStorage.getItem(this.key) === str) return;

		localStorage.setItem(this.key, str);
		this._data = this.parse(str);
	}

	private set _data(v: DeepReadonly<Type>) {
		Object.assign(this, { data: v });
		this._onChange.fireNoError(this.data);
	}

	protected abstract parse(str: string): DeepReadonly<Type>;
	protected abstract stringify(data: Type): string;
}

export class LocalStorageString extends LocalStorage<string> {
	protected override parse(str: string): DeepReadonly<string> {
		return str;
	}
	protected override stringify(data: string): string {
		return data;
	}
}

export class LocalStorageObject<T extends object> extends LocalStorage<T> {
	merge(input: Partial<T>): void {
		this.set({ ...this.data, ...input } as any);
	}

	/** 仅用于调试 */
	active(): T {
		return developProxy(this.data, () => {
			this.set(this.data as any);
		}) as any;
	}

	protected override parse(str: string): DeepReadonly<T> {
		return JSON.parse(str);
	}
	protected override stringify(data: T): string {
		return JSON.stringify(data);
	}
}

function developProxy(data: any, update: () => void) {
	return new Proxy(data, {
		get(target, prop) {
			const val = Reflect.get(target, prop);
			if (val && typeof val === 'object') {
				return developProxy(val, update);
			}
			return val;
		},
		set(target, prop, value) {
			const pval = Reflect.get(target, prop);
			if (pval === value) return true;

			if (Reflect.set(target, prop, value)) {
				update();
				return true;
			}
			return false;
		},
		deleteProperty(target, p) {
			if (Reflect.deleteProperty(target, p)) {
				update();
				return true;
			} else {
				return false;
			}
		},
	});
}
