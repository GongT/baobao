/// <reference types="@types/heft-jest" />

import { sleep } from '@idlebox/common';
import { LossyAsyncQueue } from './AsyncQueue.js';

function Work(success: boolean) {
	return jest.fn(() => {
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
		const cb = jest.fn();

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

		expect(work).toBeCalledTimes(1);
		expect(work).toBeCalledWith(1);

		await q.dispose();

		expect(work).toBeCalledTimes(1);
		expect(cb).toBeCalledTimes(1);
		expect(cb).toBeCalledWith(undefined);
	});
	it('immediate dispose cancel run', async () => {
		// console.log('== immediate dispose cancel run ==');
		const work = Work(false);
		const q = new LossyAsyncQueue<number>(work);
		q.pushQueue(1);
		await q.dispose();
		expect(work).toBeCalledTimes(0);
	});
	it('call error callback', async () => {
		// console.log('== call error callback ==');
		const work = Work(false);
		const cb = jest.fn();

		const q = new LossyAsyncQueue<number>(work);
		q.onError(cb);
		q.onComplete(cb);
		q.pushQueue(1);

		await q.promise;

		await q.dispose();

		expect(cb).toBeCalledTimes(1);
		expect(cb).toBeCalledWith(expect.any(Error));
	});
	it('call at right timing', async () => {
		// console.log('== call at right timing ==');
		let timeing = 0;
		let got = -1;
		const cb = jest.fn(async () => {
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

		expect(cb).toBeCalledTimes(1);
		expect(got).toBe(2);
	});

	it('ensure last call', async () => {
		// console.log('== ensure last call ==');
		const work = Work(true);
		const cb = jest.fn();

		const q = new LossyAsyncQueue<number>(work);
		q.onComplete(cb);

		q.pushQueue(11);
		await sleep(0);
		expect(work).toBeCalledTimes(1);

		q.pushQueue(22);
		await sleep(0);
		expect(work).toBeCalledTimes(1);

		await q.promise;
		expect(work).toBeCalledTimes(1);

		await sleep(30);
		expect(work).toBeCalledTimes(2);

		await q.dispose();

		expect(work).toBeCalledWith(11);
		expect(work).toBeCalledWith(22);
		expect(cb).toBeCalledTimes(2);
	});

	it('not call after dispose', async () => {
		// console.log('== not call after dispose ==');
		const work = Work(true);
		const q = new LossyAsyncQueue<number>(work);
		await q.dispose();

		expect(() => q.pushQueue(99)).toThrowError();

		await q.dispose();
	});
});
