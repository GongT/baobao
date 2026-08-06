import { sleep } from '@idlebox/common';
import { describe, expect, it, vi } from 'vitest';
import { LossyAsyncQueue } from './AsyncQueue.js';

function Work(success: boolean) {
	return vi.fn(() => {
		return new Promise<void>((resolve, reject) => {
			// console.log(' ====== work ======');
			if (success) {
				setTimeout(resolve, 10);
			} else {
				setTimeout(() => reject(new Error('test')), 10);
			}
		});
	});
}

describe('LossyAsyncQueue', () => {
	it('normal lifecycle', async () => {
		// console.log('== normal lifecycle ==');
		const work = Work(true);
		const cb = vi.fn();

		const q = new LossyAsyncQueue<number>(work);
		q.onError(cb);
		q.onComplete(cb);

		setImmediate(() => {
			// console.log('setImmediate should call before work');
			q.pushQueue(1);
		});
		q.pushQueue(2);
		q.pushQueue(3);
		q.pushQueue(4);
		q.pushQueue(5);
		expect(work).not.toBeCalled();

		await sleep(30);

		expect(work).toHaveBeenCalledTimes(1);
		expect(work).toHaveBeenCalledWith(1);

		await q.dispose();

		expect(work).toHaveBeenCalledTimes(1);
		expect(cb).toHaveBeenCalledTimes(1);
		expect(cb).toHaveBeenCalledWith(undefined);
	});
	it('immediate dispose cancel run', async () => {
		// console.log('== immediate dispose cancel run ==');
		const work = Work(false);
		const q = new LossyAsyncQueue<number>(work);
		q.pushQueue(1);
		await q.dispose();
		expect(work).toHaveBeenCalledTimes(0);
	});
	it('call error callback', async () => {
		// console.log('== call error callback ==');
		const work = Work(false);
		const cb = vi.fn();

		const q = new LossyAsyncQueue<number>(work);
		q.onError(cb);
		q.onComplete(cb);
		q.pushQueue(1);

		await q.promise;

		await q.dispose();

		expect(cb).toHaveBeenCalledTimes(1);
		expect(cb).toHaveBeenCalledWith(expect.any(Error));
	});
	it('call at right timing', async () => {
		// console.log('== call at right timing ==');
		let timeing = 0;
		let got = -1;
		const cb = vi.fn(async () => {
			got = timeing;
		});

		const q = new LossyAsyncQueue<number>(cb);

		timeing = 1;
		q.pushQueue(66);
		timeing = 2;
		await q.promise;
		timeing = 3;

		await q.dispose();
		timeing = 4;

		expect(cb).toHaveBeenCalledTimes(1);
		expect(got).toBe(2);
	});

	it('ensure last call', async () => {
		// console.log('== ensure last call ==');
		const work = Work(true);
		const cb = vi.fn();

		const q = new LossyAsyncQueue<number>(work);
		q.onComplete(cb);

		q.pushQueue(11);
		await sleep(0);
		expect(work).toHaveBeenCalledTimes(1);

		q.pushQueue(22);
		await sleep(0);
		expect(work).toHaveBeenCalledTimes(1);

		await q.promise;
		expect(work).toHaveBeenCalledTimes(1);

		await sleep(30);
		expect(work).toHaveBeenCalledTimes(2);

		await q.dispose();

		expect(work).toHaveBeenCalledWith(11);
		expect(work).toHaveBeenCalledWith(22);
		expect(cb).toHaveBeenCalledTimes(2);
	});

	it('not call after dispose', async () => {
		// console.log('== not call after dispose ==');
		const work = Work(true);
		const q = new LossyAsyncQueue<number>(work);
		await q.dispose();

		expect(() => q.pushQueue(99)).toThrow();

		await q.dispose();
	});
});
