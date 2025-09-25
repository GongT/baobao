import type { IDisposable } from '../dispose/disposable.js';
import type { Emitter } from './event.js';

/**
 * 事件注册对象
 */
export interface IEventEmitter<T = unknown> extends IDisposable {
	/**
	 * @returns 当前注册回调数量
	 */
	listenerCount(): number;

	/**
	 * 触发本事件，任何一个回调错误，都会导致直接抛出异常，其他未知数量的回调将不会被执行
	 * @param data 回调数据
	 */
	fire(data: T): void;

	/**
	 * 与 `fire()`相同，但是忽略任何错误
	 * 即便出错也继续执行全部callback
	 *
	 * 抛出的异常会直接丢弃
	 * 除了disposed错误外，其他错误都不会被重新抛出
	 */
	fireNoError(data: T): void;

	/**
	 * 注册本事件的新回调
	 * 这个实例方法已经bind过
	 * @param callback 回调函数
	 */
	handle(callback: EventHandler<T>): IDisposable;

	/**
	 * @alias handle
	 */
	readonly register: EventRegister<T>;

	/**
	 * @alias handle AI喜欢用event
	 */
	readonly event: EventRegister<T>;

	/**
	 * 注册一次性回调
	 * @param callback 回调函数
	 */
	once(callback: EventHandler<T>): IDisposable;

	/**
	 * 创建一个等待下次触发的promise
	 */
	wait(): Promise<T>;

	readonly hasDisposed: boolean;
}

export type EventHandler<T> = (data: T) => void;

/**
 * 所有方法都已经bind了
 */
export interface EventRegister<T> {
	(callback: EventHandler<T>): IDisposable;
	once(callback: EventHandler<T>): IDisposable;
	wait(): IDisposable;
	readonly hasDisposed: boolean;
}

export type EventEmitterMap<T extends Record<string, unknown>> = {
	[K in keyof T]: Emitter<T[K]>;
};
