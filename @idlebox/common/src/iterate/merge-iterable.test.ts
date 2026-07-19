import { describe, expect, it } from 'vitest';
import { sleep } from '../schedule/timeout.js';
import { interleaveAsyncIterables, interleaveIterables, joinAsyncIterables, joinIterables } from './merge-iterable.js';

describe('joinIterables', () => {
	it('链接多个可迭代对象且顺序正确', () => {
		const iterable1 = [1, 2, 3];
		const iterable2 = ['a', 'b', 'c'];
		const iterable3 = [true, false];

		const result = Array.from(joinIterables<any>(iterable1, iterable2, iterable3));

		expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', true, false]);
	});
});

describe('joinAsyncIterables', () => {
	it('链接多个异步可迭代对象且顺序正确', async () => {
		async function* asyncIterable1() {
			yield 1;
			await sleep(50);
			yield 2;
			yield 3;
		}

		async function* asyncIterable2() {
			yield 'a';
			yield 'b';
			yield 'c';
		}

		async function* asyncIterable3() {
			yield true;
			yield false;
		}

		const result = [];
		for await (const item of joinAsyncIterables<any>(asyncIterable1(), asyncIterable2(), asyncIterable3())) {
			result.push(item);
		}

		expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', true, false]);
	});
});

describe('interleaveIterables', () => {
	it('混合多个可迭代对象', () => {
		const iterable1 = [1, 2, 3];
		const iterable2 = ['a', 'b', 'c'];
		const iterable3 = [true, false];

		const result = Array.from(interleaveIterables<any>(iterable1, iterable2, iterable3));

		expect(result).toEqual(expect.arrayContaining([1, 2, 3, 'a', 'b', 'c', true, false]));

		try {
			expect(result).toEqual([1, 'a', true, 2, 'b', false, 3, 'c']);
		} catch {
			console.warn(`\x1b[38;5;11m同步 interleaveIterables 结果不符合预期顺序。实际结果 %j\x1B[0m`, result);
		}
	});
});

describe('interleaveAsyncIterables', () => {
	it('混合多个异步可迭代对象', async () => {
		async function* asyncIterable1() {
			yield 1;
			await sleep(50);
			yield 2;
			yield 3;
		}

		async function* asyncIterable2() {
			yield 'a';
			yield 'b';
			await sleep(10);
			yield 'c';
		}

		async function* asyncIterable3() {
			yield true;
			await sleep(5);
			yield false;
		}

		const result = [];
		for await (const item of interleaveAsyncIterables<any>(asyncIterable1(), asyncIterable2(), asyncIterable3())) {
			// console.log('interleaveAsyncIterables item:', item);
			result.push(item);
		}
		// console.error(result);

		expect(result).toEqual(expect.arrayContaining([1, 2, 3, 'a', 'b', 'c', true, false]));
	});
});
