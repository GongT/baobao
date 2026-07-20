import { describe, expect, it, vi } from 'vitest';
import { sleep } from '../schedule/timeout.js';
import { PromiseAttachAsyncNotify } from './promise-with-notify.js';

describe('PromiseAttachAsyncNotify', () => {
	it('基本功能可用', async () => {
		const p = PromiseAttachAsyncNotify.withResolvers();

		const mock_progress = vi.fn();
		const mock_resolve = vi.fn();
		const mock_reject = vi.fn();

		p.promise.progress(mock_progress);
		p.promise.then(mock_resolve).catch(mock_reject);

		p.notify('progress1');
		p.notify('progress2');
		p.resolve('result');

		expect(mock_progress).toHaveBeenCalledTimes(2);
		expect(mock_progress).toHaveBeenNthCalledWith(1, 'progress1');
		expect(mock_progress).toHaveBeenNthCalledWith(2, 'progress2');

		await p.promise;

		expect(mock_resolve).toHaveBeenCalledTimes(1);
		expect(mock_resolve).toHaveBeenCalledWith('result');

		expect(mock_reject).not.toHaveBeenCalled();
	});

	describe('完成后', () => {
		it('不允许注册通知回调', async () => {
			const p = PromiseAttachAsyncNotify.withResolvers();

			p.resolve('result');
			await p.promise;

			expect(() => {
				p.promise.progress(() => {});
			}).toThrow();
		});

		it('允许通知但无效', async () => {
			const p = PromiseAttachAsyncNotify.withResolvers();

			const mock_progress = vi.fn();
			p.promise.progress(mock_progress);
			p.resolve('result');

			await p.promise;

			expect(() => {
				p.notify('progress1');
			}).not.toThrow();
			expect(mock_progress).not.toHaveBeenCalled();
		});
	});

	it('异步通知', async () => {
		const p = PromiseAttachAsyncNotify.withResolvers(true);

		const mock_progress = vi.fn();

		p.promise.progress(mock_progress);

		p.notify('progress1');
		p.notify('progress2');
		p.resolve('result');

		expect(mock_progress).not.toHaveBeenCalled();

		await p.promise;
		await sleep(100);

		expect(mock_progress).toHaveBeenCalledTimes(2);
	});

	it('通知回调中抛出异常不会影响后续通知', async () => {
		const p = PromiseAttachAsyncNotify.withResolvers();

		const mock_progress = vi.fn();
		const shoud_error = vi.fn();

		p.promise.progress((progress) => {
			mock_progress(progress);
			if (progress === 'progress2') {
				throw new Error('error in progress callback');
			}
		});

		p.notify('progress1');
		try {
			p.notify('progress2');
		} catch {
			shoud_error();
		}
		p.notify('progress3');
		p.resolve('result');
		await sleep(100);

		await p.promise;

		expect(mock_progress).toHaveBeenCalledTimes(3);
		expect(shoud_error).toHaveBeenCalled();
	});
});
