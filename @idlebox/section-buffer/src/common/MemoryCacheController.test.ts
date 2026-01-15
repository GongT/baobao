/// <reference types="@types/heft-jest" />

import { resolve } from 'node:path';
import { kb, mb, randomTestFile, tmpdir } from '../helper.test.d/testlib.js';
import { type IMemCachePart, MemoryCacheController } from './MemoryCacheController.js';

const exampleFile = resolve(tmpdir, 'index-example.bin');
const test100 = randomTestFile(exampleFile, 100 * mb);

function slice(start: number, length: number): IMemCachePart {
	return {
		buffer: test100.subarray(start, start + length),
		start,
		length,
	};
}

describe('MemoryCacheController', () => {
	it('works normally', () => {
		const mm = new MemoryCacheController(100 * mb);
		mm.push(slice(50 * mb, 50 * mb));
		mm.push(slice(49 * mb + 1 * kb, mb - 1 * kb));
		mm.push(slice(0, 49 * mb));
		expect(mm.viewState.length).toBe(2);

		expect(mm.isFullfilled()).toBe(false);
		expect(mm.memoryUsage).toBe(100 * mb - 1 * kb);

		mm.push(slice(49 * mb, 1 * kb));

		expect(mm.isFullfilled()).toBe(true);

		expect((mm as any).list.length).toBe(1);

		expect(() => mm.check()).not.toThrow();

		const d = mm.shift()!;
		expect(d).toBeTruthy();

		expect(mm.shift()).toBeFalsy();

		expect(d.buffers).toHaveLength(4);

		const buf = Buffer.concat(d.buffers);
		expect(Buffer.compare(buf, test100)).toBe(0);
	});

	it('works with merge', () => {
		const mm = new MemoryCacheController(100 * mb);
		mm.push({ start: 0, length: 10 });
		mm.push(slice(10, 10));
		expect(mm.viewState.length).toBe(2);

		mm.push({ start: 100, length: 10 });
		mm.push(slice(110, 10));
		mm.push({ start: 120, length: 10 });
		expect(mm.viewState.length).toBe(5);

		expect(mm.memoryUsage).toBe(20);

		expect(mm.shift()?.start).toBe(10);
		expect(mm.memoryUsage).toBe(10);
		expect(mm.viewState.length).toBe(4);

		expect(mm.shift()?.start).toBe(110);
		expect(mm.memoryUsage).toBe(0);
		expect(mm.viewState.length).toBe(2);

		expect(mm.shift()).toBeFalsy();
	});

	it('throw error when conflict', () => {
		const mm = new MemoryCacheController(50 * mb);
		const tbuff = Buffer.alloc(10);

		// over flow size
		expect(() => mm.push(slice(50 * mb - 1, 2))).toThrow(/invalid buffer/);
		expect(() => mm.push(slice(0, 50 * mb + 1))).toThrow(/invalid buffer/);

		// invalid args
		expect(() => mm.push({ start: 0, length: 0, buffer: Buffer.allocUnsafe(0) })).toThrow(/invalid buffer/);
		expect(() => mm.push({ start: -1, length: 10, buffer: tbuff })).toThrow(/invalid buffer/);
		expect(() => mm.push({ start: 0, length: 11, buffer: tbuff })).toThrow(/invalid buffer/);

		mm.push(slice(0, 10 * mb));
		mm.push(slice(40 * mb, 10 * mb));

		// overlap
		expect(() => mm.push(slice(9 * mb, 2 * mb))).toThrow(/invalid buffer/);
		expect(() => mm.push(slice(39 * mb, 2 * mb))).toThrow(/invalid buffer/);
		expect(() => mm.push(slice(45 * mb, mb))).toThrow(/invalid buffer/);
	});

	describe('puch holes', () => {
		it('works', () => {
			const mm = new MemoryCacheController(100);
			mm.push({ start: 0, length: 40 });
			mm.push({ start: 60, length: 40 });

			mm.punchHole({ start: 30, length: 40 });
			expect(mm.viewState).toEqual([
				{ start: 0, length: 30, written: true },
				{ start: 70, length: 30, written: true },
			]);

			mm.punchHole({ start: 40, length: 10 });
			expect(mm.viewState).toEqual([
				{ start: 0, length: 30, written: true },
				{ start: 70, length: 30, written: true },
			]);

			mm.punchHole({ start: 30, length: 40 });
			expect(mm.viewState).toEqual([
				{ start: 0, length: 30, written: true },
				{ start: 70, length: 30, written: true },
			]);

			mm.punchHole({ start: 5, length: 1 });
			expect(mm.viewState).toEqual([
				{ start: 0, length: 5, written: true },
				{ start: 6, length: 24, written: true },
				{ start: 70, length: 30, written: true },
			]);

			mm.punchHole({ start: 0, length: 20 });
			expect(mm.viewState).toEqual([
				{ start: 20, length: 10, written: true },
				{ start: 70, length: 30, written: true },
			]);

			mm.punchHole({ start: 0, length: 60 });
			expect(mm.viewState).toEqual([{ start: 70, length: 30, written: true }]);

			expect(() => mm.check()).not.toThrow();
		});

		it('not allow punch on data', () => {
			const mm = new MemoryCacheController(100);
			mm.push({ start: 50, length: 40, buffer: Buffer.allocUnsafe(40) });

			expect(() => mm.punchHole({ start: 40, length: 51 })).toThrow('on data');
			expect(() => mm.punchHole({ start: 89, length: 95 })).toThrow('on data');
			expect(() => mm.punchHole({ start: 0, length: 100 })).toThrow('on data');
			expect(() => mm.punchHole({ start: 60, length: 10 })).toThrow('on data');

			expect(() => mm.check()).not.toThrow();
		});
	});
});
