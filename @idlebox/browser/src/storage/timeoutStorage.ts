export class TimeoutStorage<T> {
	private readonly valueKey: string;
	private readonly expireKey: string;

	constructor(key: string, private readonly storage: Storage = localStorage) {
		this.valueKey = key + '::value';
		this.expireKey = key + '::expire';
	}

	save(data: Readonly<T>, expire: string | Date) {
		if (expire instanceof Date) {
			expire = expire.toUTCString();
		}

		// console.log('[%s] add [%s] %s', this.key, expire, data);
		this.storage.setItem(this.valueKey, JSON.stringify(data));
		this.storage.setItem(this.expireKey, expire);
	}

	forget() {
		// console.log('[%s] forget.', this.key);
		this.storage.removeItem(this.valueKey);
	}

	getExpire() {
		const o = this.storage.getItem(this.expireKey);
		if (!o || new Date(o) < new Date()) {
			// console.log('[%s] outdate.', this.key);
			this.forget();
			return null;
		}

		return new Date(o);
	}

	read(defaultVal: Readonly<T>): Readonly<T>;
	read(): Readonly<T> | undefined;

	read(defaultVal?: Readonly<T>): Readonly<T> | undefined {
		const json = this.storage.getItem(this.valueKey);
		if (!json) {
			return defaultVal;
		}

		const o = this.storage.getItem(this.expireKey);
		if (!o || new Date(o) < new Date()) {
			// console.log('[%s] outdate.', this.key);
			this.forget();
			return defaultVal;
		}

		try {
			return JSON.parse(json);
		} catch (e) {
			// console.warn('[%s] JSON %s', this.key, e.message);
			this.forget();
			return defaultVal;
		}
	}
}
