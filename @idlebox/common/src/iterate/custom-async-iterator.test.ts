/// <reference types="development_using_node" />

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { sleep } from '../schedule/timeout.js';
import { ActiveAsyncDataSource, createAsyncIterator, PassiveAsyncDataSource } from './custom-async-iterator.js';

describe('被动数据源', async () => {
	function limitedSource(limit = 5) {
		let counter = 0;
		const src = new PassiveAsyncDataSource<number>(async () => {
			await sleep(10);
			const r = ++counter;
			if (r >= limit) {
				src.finish();
			}
			return r;
		});
		return src;
	}

	function endlessSource() {
		let counter = 0;
		return new PassiveAsyncDataSource<number>(async () => {
			await sleep(10);
			return ++counter;
		});
	}

	test('基本被动异步数据源', async () => {
		const src = limitedSource(5);
		const it = createAsyncIterator(src);

		let i = 0;
		for await (const num of it) {
			i++;
			expect(num).toBe(i);
		}
		expect(i).toBe(5);
		expect(src.disposed).toBe(true);
	});

	test('提前中断循环', async () => {
		const src = endlessSource();

		const it = createAsyncIterator(src);

		let i = 0;
		for await (const num of it) {
			i++;
			expect(num).toBe(i);
			if (num > 5) {
				break;
			}
		}
		expect(i).toBe(6);
		expect(src.disposed).toBe(true);
	});

	test('循环中异常', async () => {
		const theError = new Error('expected error');
		const src = endlessSource();
		const it = createAsyncIterator(src);

		try {
			for await (const num of it) {
				if (num > 5) {
					throw theError;
				}
			}
			expect.fail(`应该抛出异常`);
		} catch (e) {
			expect(e).toBe(theError);
		}
		expect(src.disposed).toBe(true);
	});

	test('数据源中异常', async () => {
		const theError = new Error('expected error');
		let counter = 0;
		const src = new PassiveAsyncDataSource<number>(async () => {
			await sleep(10);
			counter++;
			if (counter > 3) {
				throw theError;
			}
			return counter;
		});

		try {
			for await (const _num of createAsyncIterator(src)) {
			}
			expect.fail(`应该抛出异常`);
		} catch (e) {
			expect(e).toBe(theError);
		}

		expect(src.disposed).toBe(true);
	});
});

describe('主动数据源', async () => {
	let defSrc: ActiveAsyncDataSource<number>;
	beforeEach(() => {
		defSrc = new ActiveAsyncDataSource<number>({
			maxBufferSize: 10,
		});
	});

	test('基本主动异步数据源', async () => {
		for (let i = 0; i < 5; i++) {
			defSrc.push(i);
		}
		defSrc.finish();

		const it = createAsyncIterator(defSrc);
		let j = 0;
		for await (const num of it) {
			expect(num).toBe(j);
			j++;
		}
		expect(j).toBe(5);
		expect(defSrc.disposed).toBe(true);
	});

	test('溢出数据', async () => {
		for (let i = 0; i < 15; i++) {
			defSrc.push(i);
		}
		defSrc.finish();

		const it = createAsyncIterator(defSrc);
		let j = 0;
		for await (const num of it) {
			expect(num).toBe(j + 5);
			j++;
		}
		expect(j).toBe(10);
		expect(defSrc.disposed).toBe(true);
	});

	function endless(src = defSrc) {
		let counter = 0;
		const timer = setInterval(() => {
			src.push(counter++);
		}, 10);

		const mockCallback = vi.fn();

		defSrc._register({
			dispose() {
				mockCallback();
				clearInterval(timer);
			},
		});

		return {
			get counter() {
				return counter;
			},
			disposed: mockCallback,
		};
	}

	test('提前中断循环', async () => {
		const timer = endless();

		for await (const num of createAsyncIterator(defSrc)) {
			if (num > 5) {
				break;
			}
		}

		expect(timer.counter).toBeGreaterThanOrEqual(5);
		expect(defSrc.disposed).toBe(true);
		expect(timer.disposed).toHaveBeenCalled();
	});

	test('循环中异常', async () => {
		const timer = endless();

		const theError = new Error('expected error');

		try {
			for await (const num of createAsyncIterator(defSrc)) {
				if (num > 5) {
					throw theError;
				}
			}
			expect.fail(`应该抛出异常`);
		} catch (e) {
			expect(e).toBe(theError);
		}

		expect(defSrc.disposed).toBe(true);
		expect(timer.disposed).toHaveBeenCalled();
	});

	test('数据源中异常', async () => {
		const timer = endless();

		const theError = new Error('expected error');

		setTimeout(() => {
			defSrc.throwError(theError);
		}, 80);

		try {
			for await (const _num of createAsyncIterator(defSrc)) {
			}
			expect.fail(`应该抛出异常`);
		} catch (e) {
			expect(e).toBe(theError);
		}

		expect(defSrc.disposed).toBe(true);
		expect(timer.disposed).toHaveBeenCalled();
	});
});
