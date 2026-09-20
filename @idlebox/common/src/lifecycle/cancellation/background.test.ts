import { describe, expect, it } from 'vitest';
import { CancellationTokenSource } from './source.js';
import { background } from './background.js';

function resolveTo<T>(value: T, delay: number): Promise<T> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(value), delay);
	});
}

describe('background', () => {
	it('should resolve the promise', async () => {
		const result = await background(resolveTo(42, 200));
		expect(result).toBe(42);
	});

	it('should reject the promise when aborted', async () => {
		const source = new CancellationTokenSource();

		setTimeout(() => {
			source.cancel();
		}, 0);
		try {
			await background(resolveTo(42, 200), source.token);
		} catch (err: any) {
			expect(err).toBeDefined();
			expect(err.name).toBe('CanceledError');
			return;
		}

		expect.fail('Promise 应该被中止');
	});

	it('should resolve immediately if already aborted', async () => {
		const source = new CancellationTokenSource();
		source.cancel();

		try {
			await background(resolveTo(42, 0), source.token);
		} catch (err: any) {
			expect(err).toBeDefined();
			expect(err.name).toBe('CanceledError');
			return;
		}

		expect.fail('Promise 应该被中止');
	});

	it('should reject with reason', async () => {
		const source = new CancellationTokenSource();
		const reason = new Error('Test reason');

		setTimeout(() => {
			source.cancel(reason);
		}, 0);

		try {
			await background(resolveTo(42, 200), source.token);
		} catch (err: any) {
			expect(err).toBeDefined();
			expect(err).toBe(reason);
			return;
		}

		expect.fail('Promise 应该被中止');
	});

	it('should trigger cancel by dispose', async () => {
		const source = new CancellationTokenSource();

		setTimeout(() => {
			source.dispose();
		}, 0);

		try {
			await background(resolveTo(42, 200), source.token);
		} catch (err: any) {
			expect(err).toBeDefined();
			expect(err.name).toBe('CanceledError');
			return;
		}

		expect.fail('Promise 应该被中止');
	});

	it('should not trigger cancel if disposed after fullfilled', async () => {
		const source = new CancellationTokenSource();

		setTimeout(() => {
			source.fullfilled();
			source.dispose();
		}, 0);

		try {
			const result = await background(resolveTo(42, 200), source.token);
			expect(result).toBe(42);
		} catch (err: any) {
			expect.fail(err);
		}
	});
});
