const symbol = Symbol.for('asynclock');

function getLock(obj: any): AsyncLock {
	if (!obj[symbol]) {
		// console.log('[AsyncLock] create new lock for %s', obj.constructor.name);
		obj[symbol] = new AsyncLock();
	}
	return obj[symbol];
}

type AsyncFun<T, A extends any[], R> = (this: T, ...args: A) => Promise<R>;

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
		this.current = undefined;
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

	static protect(title: string, weak = false) {
		return <T, A extends any[], R>(
			original: AsyncFun<T, A, R | undefined>,
			_context: ClassMethodDecoratorContext<T, AsyncFun<T, A, R | undefined>>
		): AsyncFun<T, A, R | undefined> => {
			async function asyncLock__Protect(this: any, ...args: any) {
				const lock = getLock(this);
				const ok = lock.acquire(title, weak);
				if (!ok) return;
				return original.apply(this, args).finally(() => {
					lock.release(title);
				});
			}

			return asyncLock__Protect;
		};
	}

	static start(title: string) {
		return <T, A extends any[], R>(
			original: AsyncFun<T, A, R | undefined>,
			_context: ClassMethodDecoratorContext<T, AsyncFun<T, A, R | undefined>>
		): AsyncFun<T, A, R | undefined> => {
			async function asyncLock__Start(this: any, ...args: any) {
				const lock = getLock(this);
				lock.acquire(title);
				return original.apply(this, args).catch((e: Error) => {
					lock.release(title);
					throw e;
				});
			}
			return asyncLock__Start;
		};
	}

	static finish(title: string) {
		return <T, A extends any[], R>(
			original: AsyncFun<T, A, R | undefined>,
			_context: ClassMethodDecoratorContext<T, AsyncFun<T, A, R | undefined>>
		): AsyncFun<T, A, R | undefined> => {
			async function asyncLock__Finish(this: any, ...args: any) {
				const lock = getLock(this);
				lock.require(title);
				return original.apply(this, args).finally(() => {
					lock.release(title);
				});
			}
			return asyncLock__Finish;
		};
	}

	static require(title: string) {
		return <T, A extends any[], R>(
			original: AsyncFun<T, A, R | undefined>,
			_context: ClassMethodDecoratorContext<T, AsyncFun<T, A, R | undefined>>
		): AsyncFun<T, A, R | undefined> => {
			async function asyncLock__Require(this: any, ...args: any) {
				const lock = getLock(this);
				lock.require(title);
				return original.apply(this, args);
			}
			return asyncLock__Require;
		};
	}
}
