import { isNodeJs } from '../platform/os.js';
import type { AsyncFunction } from '../promise/is-promise.js';

type ITaskScheduler = (task: Function) => void;

declare const process: any;
declare const queueMicrotask: any;

export const scheduler: ITaskScheduler = isNodeJs ? process.nextTick : (queueMicrotask ?? setTimeout);

type ITask<TArgs extends any[] = []> = AsyncFunction<TArgs, void>;

export interface ICommonTimer {
	[Symbol.dispose](): void;
	[Symbol.toPrimitive](): number;
}

abstract class BaseScheduler {
	static instance?: BaseScheduler;

	public abstract schedule(timeoutMs: number, callback: ITask): ICommonTimer;

	/**
	 * 表示定时器的0值
	 * 实际就是0
	 */
	public readonly empty: ICommonTimer = 0 as any as ICommonTimer;

	/**
	 * 删除定时器，返回 {BaseScheduler.empty}
	 */
	clear(timer: ICommonTimer): ICommonTimer {
		if (timer) {
			timer[Symbol.dispose]();
		}
		return 0 as any as ICommonTimer;
	}

	/**
	 * clear然后schedule
	 */
	public reschedule(timer: ICommonTimer, timeoutMs: number, callback: ITask): ICommonTimer {
		if (timer) {
			timer[Symbol.dispose]();
		}
		return this.schedule(timeoutMs, callback);
	}

	/**
	 * 构造一个延迟指定时间的Promise对象，该Promise会在超时后自动resolve，不会reject
	 *
	 * 可以通过[Symbol.dispose]取消定时器，取消后此Promise永不resolve
	 */
	public promise(timeoutMs: number): Promise<void> {
		const { promise, resolve } = Promise.withResolvers<void>();
		const handle = this.schedule(timeoutMs, resolve);
		Object.assign(promise, {
			[Symbol.dispose]() {
				return handle[Symbol.dispose]();
			},
			[Symbol.toPrimitive]() {
				return handle[Symbol.toPrimitive]();
			},
		});
		return promise;
	}
}

class NativeJavascriptScheduler extends BaseScheduler {
	public override schedule(timeoutMs: number, callback: ITask): ICommonTimer {
		if (timeoutMs < 0) throw new Error('NativeJavascriptScheduler: timeoutMs 不能小于零');

		const to = setTimeout(callback, timeoutMs) as unknown as number;
		return {
			[Symbol.dispose]() {
				clearTimeout(to);
			},
			[Symbol.toPrimitive]() {
				return to;
			},
		};
	}
}

class NodejsScheduler extends BaseScheduler {
	public override schedule(timeoutMs: number, callback: ITask): ICommonTimer {
		if (timeoutMs < 0) throw new Error('NodejsScheduler: timeoutMs 不能小于零');

		return setTimeout(callback, timeoutMs) as unknown as ICommonTimer;
	}
}

export function createScheduler(_driver?: undefined) {
	if (!BaseScheduler.instance) {
		BaseScheduler.instance = isNodeJs ? new NodejsScheduler() : new NativeJavascriptScheduler();
	}
	return BaseScheduler.instance;
}
