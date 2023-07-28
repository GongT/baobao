const symbol = Symbol.for('asynclock');

function getLock(obj: any): AsyncLock {
	if (!obj[symbol]) {
		// console.log('[AsyncLock] create new lock for %s', obj.constructor.name);
		obj[symbol] = new AsyncLock();
	}
	return obj[symbol];
}

export class AsyncLock {
	protected current?: string;

	acquire(title: string, weak = false) {
		if (this.current !== undefined) {
			if (weak && this.current === title) {
				// console.log('[AsyncLock] acquire weak: %s', title);
				return false;
			}
			// console.log('[AsyncLock] acquire fail: %s | current=%s', title, this.current);
			throw new Error(`[AsyncLock] is running: ${this.current}, can not acquire ${title}`);
		}
		this.current = title;
		// console.log('[AsyncLock] aquire ok: %s %s', title, weak ? '(weak)' : '');
		return true;
	}
	release(title: string) {
		if (this.current !== title) {
			// console.log('[AsyncLock] release fail: %s | current=%s', title, this.current);
			throw new Error(`[AsyncLock] is running: ${this.current}, can not release ${title}`);
		}
		// console.log('[AsyncLock] release ok: %s', title);
		delete this.current;
	}
	require(title: string) {
		if (this.current !== title) {
			// console.log('[AsyncLock] require fail: %s | current=%s', title, this.current);
			throw new Error(`[AsyncLock] is require lock: ${title}, current is ${this.current}`);
		}
		// console.log('[AsyncLock] require ok: %s', title);
		this.current = title;
	}

	static get(obj: any): AsyncLock {
		return getLock(obj);
	}

	static protect(title: string, weak = false): MethodDecorator {
		return (_proto: any, _key, desc: TypedPropertyDescriptor<any>) => {
			const original = desc.value;
			desc.value = async function (this: any, ...args: any) {
				const lock = getLock(this);
				const ok = lock.acquire(title, weak);
				if (!ok) return;
				return original.apply(this, args).finally(() => {
					lock.release(title);
				});
			};

			return desc;
		};
	}

	static start(title: string): MethodDecorator {
		return (_proto: any, _key, desc: TypedPropertyDescriptor<any>) => {
			const original = desc.value;
			desc.value = async function (this: any, ...args: any) {
				const lock = getLock(this);
				lock.acquire(title);
				return original.apply(this, args).catch((e: Error) => {
					lock.release(title);
					throw e;
				});
			};
		};
	}

	static finish(title: string): MethodDecorator {
		return (_proto: any, _key, desc: TypedPropertyDescriptor<any>) => {
			const original = desc.value;
			desc.value = async function (this: any, ...args: any) {
				const lock = getLock(this);
				lock.require(title);
				return original.apply(this, args).finally(() => {
					lock.release(title);
				});
			};
		};
	}

	static require(title: string): MethodDecorator {
		return (_proto: any, _key, desc: TypedPropertyDescriptor<any>) => {
			const original = desc.value;
			desc.value = async function (this: any, ...args: any) {
				const lock = getLock(this);
				lock.require(title);
				return original.apply(this, args);
			};
		};
	}
}
