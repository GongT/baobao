import process from 'node:process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedDisposable } from './sync-disposable.js';

const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => {});

const gc = (globalThis as any).gc;

beforeEach(() => {
	stderrSpy.mockClear();
});

describe('可释放对象的调试信息', () => {
	it('重复注册时发送警告', () => {
		const parent1 = new EnhancedDisposable('parent1');
		const parent2 = new EnhancedDisposable('parent2');

		const child1 = new EnhancedDisposable('child1');

		parent1._register(child1);
		parent2._register(child1);

		expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('资源重复注册'));
	});

	it('弱后强警告', () => {
		const parent1 = new EnhancedDisposable('parent1');
		const parent2 = new EnhancedDisposable('parent2');
		const parent3 = new EnhancedDisposable('parent3');

		const child1 = new EnhancedDisposable('child1');

		parent1._register(child1, true);
		parent2._register(child1, true);
		parent3._register(child1);

		expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('资源重复注册'));
	});

	it('强后弱警告', () => {
		const parent1 = new EnhancedDisposable('parent1');
		const parent2 = new EnhancedDisposable('parent2');
		const parent3 = new EnhancedDisposable('parent3');

		const child1 = new EnhancedDisposable('child1');

		parent1._register(child1);
		parent2._register(child1, true);
		parent3._register(child1, true);

		expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('资源重复注册'));
		expect(stderrSpy).toHaveBeenCalledTimes(2);
	});

	it('允许弱引用注册', () => {
		const parent1 = new EnhancedDisposable('parent1');
		const parent2 = new EnhancedDisposable('parent2');
		const parent3 = new EnhancedDisposable('parent3');

		const child1 = new EnhancedDisposable('child1');

		parent1._register(child1, true);
		parent2._register(child1, true);
		parent3._register(child1, true);

		expect(stderrSpy).not.toHaveBeenCalled();
	});
});

describe('可释放对象内存引用', () => {
	it('存储引用', async () => {
		const w = new WeakRef(new EnhancedDisposable('child'));
		expect(!!w.deref()).toBeTruthy();

		const parent = new EnhancedDisposable('parent');

		parent._register(w.deref()!, true);

		await new Promise((resolve) => setTimeout(resolve, 10));

		gc();
		expect(!!w.deref()).toBeTruthy();
	});

	it('释放后移除', async () => {
		const w = new WeakRef(new EnhancedDisposable('child'));
		expect(!!w.deref()).toBeTruthy();

		const parent = new EnhancedDisposable('parent');

		parent._register(w.deref()!, true).dispose();

		await new Promise((resolve) => setTimeout(resolve, 10));

		gc();
		expect(!!w.deref()).toBeFalsy();
	});

	it('外部释放后移除', async () => {
		const w = new WeakRef(new EnhancedDisposable('child'));
		expect(!!w.deref()).toBeTruthy();

		const parent = new EnhancedDisposable('parent');

		parent._register(w.deref()!, true);
		parent.dispose();

		await new Promise((resolve) => setTimeout(resolve, 10));

		gc();
		expect(!!w.deref()).toBeFalsy();
	});

	it('强引用外部释放后移除', async () => {
		const w = new WeakRef(new EnhancedDisposable('child'));
		expect(!!w.deref()).toBeTruthy();

		const parent = new EnhancedDisposable('parent');

		parent._register(w.deref()!);
		parent.dispose();

		await new Promise((resolve) => setTimeout(resolve, 10));

		gc();
		expect(!!w.deref()).toBeFalsy();
	});

	it('强引用自身释放后无法移除', async () => {
		const w = new WeakRef(new EnhancedDisposable('child'));
		expect(!!w.deref()).toBeTruthy();

		const parent = new EnhancedDisposable('parent');

		parent._register(w.deref()!).dispose();

		await new Promise((resolve) => setTimeout(resolve, 10));

		gc();
		expect(!!w.deref()).toBeTruthy();
	});
});
