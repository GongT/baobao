import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedAsyncDisposable } from './async-disposable.js';
import { DuplicateDisposeAction } from './disposable.js';
import { EnhancedDisposable } from './sync-disposable.js';

const stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

class RelaxDisposable extends EnhancedDisposable {
	protected override duplicateDispose = DuplicateDisposeAction.Allow;
}
class RelaxAsyncDisposable extends EnhancedAsyncDisposable {
	protected override duplicateDispose = DuplicateDisposeAction.Allow;

	public readonly resolve: (value?: any) => void;
	public readonly p: Promise<void>;

	constructor(displayName?: string) {
		super(displayName);
		const { promise, resolve } = Promise.withResolvers<void>();
		this.p = promise;
		this.resolve = resolve;
	}

	public override async _dispose(): Promise<void> {
		return this.p;
	}
}

beforeEach(() => {
	stderrSpy.mockClear();
});

describe('可释放对象', () => {
	it('释放后禁止使用', () => {
		const d = new EnhancedDisposable();

		d.dispose();
		expect(() => d.onPostDispose(() => {})).toThrow();
		expect(() => d._register(d)).toThrow();
		expect(() => d._unregister(d)).toThrow();
	});

	it('异步释放后立即禁止使用', async () => {
		const d = new RelaxAsyncDisposable();

		const disposePromise = d.dispose();
		expect(() => d._register(d)).toThrow();
		expect(() => d._unregister(d)).toThrow();

		// 后置事件此时还来不及清理
		expect(() => d.onPostDispose(() => {})).not.toThrow();

		d.resolve();
		await disposePromise;

		// 后置事件此时已经清理完毕
		expect(() => d.onPostDispose(() => {})).toThrow();
	});
});

describe('重复释放对象', () => {
	it('默认允许重复释放，但会发出警告', () => {
		const d = new EnhancedDisposable();

		d.dispose();
		expect(() => d.dispose()).not.toThrow();
		expect(stderrSpy).toHaveBeenCalled();
	});
	it('允许重复释放', () => {
		const stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const d = new RelaxDisposable();

		d.dispose();
		expect(() => d.dispose()).not.toThrow();
		expect(stderrSpy).not.toHaveBeenCalled();
	});

	it('不能重复释放', () => {
		const d = new (class extends EnhancedDisposable {
			protected override duplicateDispose = DuplicateDisposeAction.Disable;
		})();

		d.dispose();
		expect(() => d.dispose()).toThrow();
	});

	it('异步重复释放返回相同promise', async () => {
		const d = new RelaxAsyncDisposable();

		const disposePromise1 = d.dispose();
		const disposePromise2 = d.dispose();

		expect(disposePromise1).toBe(disposePromise2);

		d.resolve();

		await disposePromise1;
	});
});
