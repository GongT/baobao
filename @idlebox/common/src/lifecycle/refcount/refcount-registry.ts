import { createScheduler, type ICommonTimer } from '../../schedule/scheduler.js';
import { Emitter } from '../event/event.js';

interface IReference<KeyType, InstanceType> {
	readonly key: KeyType;
	readonly instance: InstanceType;
}

export interface IReturnedInstance<Type> extends Disposable {
	readonly instance: Type;
	release(): void;
}

interface ICounter {
	timer: ICommonTimer;
	count: number;
}

class Reference<KeyType, T> implements IReference<KeyType, T>, IReturnedInstance<T> {
	constructor(
		public readonly key: KeyType,
		public readonly instance: T,
		private readonly decrease: (ref: Reference<KeyType, T>) => void,
	) {}

	private released = false;
	release() {
		if (!this.released) {
			this.released = true;
			this.decrease(this);
		}
	}

	public readonly [Symbol.dispose] = this.release;
}

/**
 * 引用计数注册表，用于管理实例的引用计数，确保在引用计数归零时正确释放资源。
 */
export class RefcountRegistry<KeyType = string | number, InstanceType = any> {
	private readonly instances = new Map<KeyType, Reference<KeyType, InstanceType>>();
	private readonly counter = new Map<Reference<KeyType, InstanceType>, ICounter>();

	private readonly scheduler = createScheduler();

	private readonly _onRelease = new Emitter<IReference<KeyType, InstanceType>>();
	/**
	 * 当引用计数归零并被删除时触发此事件
	 */
	public readonly onRelease = this._onRelease.event;

	/**
	 * @param collectionTimeout 资源计数器归零后，从内部map中删除前，等待的时间（毫秒），默认立即删除（不经过setTimeout）
	 */
	constructor(private collectionTimeout: number = 0) {
		if (this.collectionTimeout < 0) {
			throw new Error('collectionTimeout 不能小于0');
		}
		this._decrease = this._decrease.bind(this);
	}

	[Symbol.dispose]() {
		this.collectionTimeout = 0;
		for (const ref of this.instances.values()) {
			ref.release();
		}

		this._onRelease.dispose();

		if (this.instances.size !== 0 || this.counter.size !== 0) throw new Error('RefcountRegistry: 理应释放所有实例');
	}

	/**
	 * 计数+1
	 * 如果存在删除定时器，则取消删除定时器
	 */
	protected _increase(ref: Reference<KeyType, InstanceType>) {
		const counter = this.counter.get(ref);
		if (counter) {
			counter.count++;
			counter.timer = this.scheduler.clear(counter.timer);
		} else {
			this.counter.set(ref, { count: 1, timer: this.scheduler.empty });
		}
	}

	/**
	 * 删除引用及其计数器，并触发释放事件
	 */
	protected _delete(ref: Reference<KeyType, InstanceType>) {
		const counter = this.counter.get(ref);
		if (!counter) throw new Error(`RefcountRegistry: ${ref.key}: 删除回调时引用计数器不存在`);
		if (counter.count !== 0) throw new Error(`RefcountRegistry: ${ref.key}: 删除回调时引用计数不为零`);

		this.instances.delete(ref.key);
		this.counter.delete(ref);
		this._onRelease.fire(ref, Emitter.EAction.PrintIgnore);
	}

	/**
	 * 计数-1，如果计数器归零，则根据collectionTimeout删除引用及其计数器
	 */
	protected _decrease(ref: Reference<KeyType, InstanceType>) {
		const counter = this.counter.get(ref);
		if (!counter) throw new Error(`RefcountRegistry: ${ref.key}: 删除回调时引用计数器不存在`);

		counter.count--;
		if (counter.count === 0) {
			if (this.collectionTimeout > 0) {
				if (counter.timer) throw new Error(`RefcountRegistry: ${ref.key}: 定时器已存在`);
				counter.timer = this.scheduler.schedule(this.collectionTimeout, () => {
					this._delete(ref);
				});
			} else {
				this._delete(ref);
			}
		} else if (counter.count < 0) {
			throw new Error(`RefcountRegistry: ${ref.key}: 引用计数小于零`);
		}
	}

	/**
	 * 获取一个引用，增加计数器，如果不存在，则什么都不做并返回undefined
	 * 一定要调用其Disposable接口释放资源（减少计数器）
	 */
	get(key: KeyType): IReturnedInstance<InstanceType> | undefined {
		const ref = this.instances.get(key);
		if (ref) {
			this._increase(ref);
		}
		return ref;
	}

	/**
	 * 获取一个引用，如果不存在则插入新的实例
	 * 一定要调用其Disposable接口释放资源（减少计数器）
	 */
	getOrInsert(key: KeyType, instance: InstanceType): IReturnedInstance<InstanceType> {
		return this.getOrInsertComputed(key, () => instance);
	}

	/**
	 * 获取一个引用，如果不存在则插入新的实例
	 * 一定要调用其Disposable接口释放资源（减少计数器）
	 */
	getOrInsertComputed(key: KeyType, compute: (key: KeyType) => InstanceType): IReturnedInstance<InstanceType> {
		this.instances.getOrInsertComputed(key, (key) => {
			return new Reference(key, compute(key), this._decrease);
		});

		// biome-ignore lint/style/noNonNullAssertion: just created
		return this.get(key)!;
	}
}
