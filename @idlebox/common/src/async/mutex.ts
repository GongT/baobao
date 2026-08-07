import { ImpossibleError, SoftwareDefectError } from '@idlebox/errors';
import { createStackTraceHolder, type StackTraceHolder } from '../error/stack-trace.js';
import { noop } from '../function/noop.js';
import { timeout } from '../schedule/timeout.js';

type LockState = MutexRelease & {
	readonly locker: StackTraceHolder;
	readonly p: Promise<void>;
};

export type MutexRelease = {
	readonly [Symbol.dispose]: () => void;
	readonly dispose: () => void;
};

export class Mutex {
	private theLock?: LockState;

	constructor(public readonly name: string = 'unknown') {}

	/**
	 * 锁定互斥锁，返回一个释放锁的对象。
	 *
	 * @example
	 * using locked = await mutex.lock();
	 * // 使用互斥锁保护的资源
	 * // 由于using，在离开作用域时，锁会自动释放
	 */
	async lock(): Promise<MutexRelease> {
		while (this.theLock) {
			await this.theLock.p;
		}

		return this.critical_lock();
	}

	/**
	 * 尝试锁定互斥锁，如果锁已被占用，则返回null。
	 *
	 * @example
	 * using locked = mutex.tryLock();
	 * if (locked) // 成功锁定
	 * else // 锁已被占用
	 */
	tryLock(): MutexRelease | null {
		if (this.theLock) return null; // 没有锁定
		return this.critical_lock();
	}

	/**
	 * 尝试锁定互斥锁，如果锁已被占用，则等待指定的时间，如果超时则抛出TimeoutError。
	 *
	 * @example
	 * try {
	 * 	using locked = await mutex.raceTimeout(1000);
	 * } catch (e) {
	 * 	if (e instanceof TimeoutError) {
	 * 		// 超时
	 * 	} else {
	 * 		throw e;
	 * 	}
	 * }
	 */
	async raceTimeout(timeoutMs: number): Promise<MutexRelease> {
		const to = timeout(timeoutMs, '获取锁');

		while (this.theLock) {
			await Promise.race([this.theLock.p, to]);
		}

		return this.critical_lock();
	}

	/**
	 * 在互斥锁保护的上下文中执行一个异步函数。
	 */
	async withLock<T>(fn: () => Promise<T>): Promise<T> {
		using _ = await this.lock();
		return await fn();
	}

	/**
	 * 等待锁，但不上锁
	 */
	async waitUnLocked(): Promise<void> {
		while (this.theLock) {
			await this.theLock.p;
		}
	}

	private critical_lock(): MutexRelease {
		if (this._disposed) throw new ImpossibleError(`锁${this.name}已销毁`);
		const stack = createStackTraceHolder(`锁${this.name}被锁定`);

		const { promise: current, resolve } = Promise.withResolvers<void>();

		const dispose = () => {
			if (this._disposed) return; // 已被销毁，释放无效

			if (this.theLock?.p !== current) {
				throw new SoftwareDefectError(`锁${this.name}释放时，所有者不匹配`, { cause: stack });
			}
			delete this.theLock;
			resolve();
		};

		this.theLock = {
			p: current,
			dispose: dispose,
			[Symbol.dispose]: dispose,
			locker: stack,
		};

		return this.theLock;
	}

	private _disposed = false;
	/**
	 * 销毁整个锁，而非释放锁。
	 * 销毁后，所有当前等待的和新的锁请求会一直等待
	 */
	dispose() {
		if (this._disposed) return;
		this._disposed = true;

		this.theLock = {
			p: new Promise(noop),
			dispose: noop,
			locker: null as any,
			[Symbol.dispose]: noop,
		};
	}

	get disposed() {
		return this._disposed;
	}

	get locked() {
		return !!this.theLock;
	}
}
