import { createScheduler, type ICommonTimer } from '../../schedule/scheduler.js';

interface IOptions<T> {
	/**
	 *
	 */
	construct(): T;
	destroy?(instance: T): void;
	readonly deletionTimeout: number;
}

/**
 * 一个引用计数器
 *
 * 不是 [WeakReference]Counter 而是 Weak[ReferenceCounter]
 * 所有引用均为强引用，只是引用目标可以不存在
 */
export class WeakReferenceCounter<T> {
	private instance?: T & Disposable;
	private originalDispose?: (() => void) | undefined;
	private count = 0;

	private readonly scheduler = createScheduler();
	private timer: ICommonTimer = this.scheduler.empty;

	constructor(private readonly options: IOptions<T>) {}

	get(): T & Disposable {
		if (this.instance) {
			this.count++;
			if (this.timer) this.timer = this.scheduler.clear(this.timer);
		} else {
			this.instance = this._build();
			this.count = 1;
		}
		return this.instance;
	}

	private _destroy(): void {
		if (this.count !== 0) throw new Error('WeakReferenceCounter: 删除时引用计数不为零');
		if (!this.instance) throw new Error('WeakReferenceCounter: 删除时实例不存在');

		const instance = this.instance;
		const destroy = () => {
			try {
				this.originalDispose?.call(instance);
				this.options.destroy?.(instance);
			} finally {
				this.originalDispose = undefined;
				this.instance = undefined;
			}
		};

		if (this.options.deletionTimeout > 0) {
			this.timer = this.scheduler.schedule(this.options.deletionTimeout, destroy);
		} else {
			destroy();
		}
	}

	private _build(): T & Disposable {
		const item = this.options.construct();
		this.originalDispose = (item as Disposable)[Symbol.dispose];

		let unref = false;
		Object.defineProperty(item, Symbol.dispose, {
			value: () => {
				if (unref) return;
				unref = true;

				this.count--;
				if (this.count < 0) throw new Error('WeakReferenceCounter: 引用计数小于零');
				if (this.count === 0) this._destroy();
			},
			enumerable: false,
			configurable: true,
			writable: false,
		});
		return item as T & Disposable;
	}
}
