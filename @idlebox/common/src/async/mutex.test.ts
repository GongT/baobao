import { TimeoutError } from '@idlebox/errors';
import { describe, expect, it, vi } from 'vitest';
import { sleep } from '../schedule/timeout.js';
import { Mutex } from './mutex.js';

describe('互斥锁', () => {
	it('基本功能', async () => {
		//
		const mutex = new Mutex('test');

		const rel = await mutex.lock();

		expect(rel.dispose).toBeDefined();
		expect(mutex.locked).toBeTruthy();

		rel.dispose();
		expect(mutex.locked).toBeFalsy();
	});

	it('只允许一个用户', async () => {
		const mutex = new Mutex('test');
		const fn1 = vi.fn();
		const fn2 = vi.fn();
		const fn3 = vi.fn();
		const order: number[] = [];
		const firstStarted = Promise.withResolvers<void>();
		const releaseFirst = Promise.withResolvers<void>();

		const task1 = mutex.withLock(async () => {
			fn1();
			await sleep(100);
			order.push(1);
			firstStarted.resolve();
			await releaseFirst.promise;
		});
		await firstStarted.promise;

		const task2 = mutex.withLock(async () => {
			fn2();
			order.push(2);
		});
		const task3 = mutex.withLock(async () => {
			fn3();
			order.push(3);
		});

		await Promise.resolve();
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn2).not.toHaveBeenCalled();
		expect(fn3).not.toHaveBeenCalled();

		releaseFirst.resolve();
		await Promise.all([task1, task2, task3]);

		expect(order).toEqual([1, 2, 3]);
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn2).toHaveBeenCalledTimes(1);
		expect(fn3).toHaveBeenCalledTimes(1);
	});

	it('销毁锁', async () => {
		const mutex = new Mutex('test');
		const rel = await mutex.lock();

		expect(mutex.locked).toBeTruthy();

		mutex.dispose();
		expect(mutex.disposed).toBeTruthy();
		expect(mutex.locked).toBeTruthy();

		rel.dispose();
		expect(mutex.locked).toBeTruthy();

		await expect(mutex.raceTimeout(100)).rejects.toThrow(TimeoutError);
	});
});
