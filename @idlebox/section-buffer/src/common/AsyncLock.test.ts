import { sleep } from '@idlebox/common';
import { describe, expect, it, vi } from 'vitest';
import { AsyncLock } from './AsyncLock.js';

function sleepJob(title: string) {
	return vi.fn(async (ms: number): Promise<number | undefined> => {
		console.log('[sleep] %s start', title);
		await sleep(ms);
		console.log('[sleep] %s stop', title);
		return 666;
	});
}

class Test {
	public readonly test = 1;

	public readonly A = sleepJob('A');
	public readonly B = sleepJob('B');
	public readonly C1 = sleepJob('C1');
	public readonly C2 = sleepJob('C2');

	@AsyncLock.protect('lA')
	runA(ms: number) {
		return this.A(ms);
	}

	@AsyncLock.protect('lB')
	async runB(ms: number) {
		return this.B(ms);
	}

	@AsyncLock.protect('lC', true)
	async runC1(ms: number) {
		return this.C1(ms);
	}
	@AsyncLock.protect('lC', true)
	async runC2(ms: number) {
		return this.C2(ms);
	}
	@AsyncLock.protect('this')
	async testThis(): Promise<this | undefined> {
		return this;
	}
}
describe('AsyncLock', () => {
	it('deny duplicate call', async () => {
		const ps = [];
		let p;
		const test = new Test();
		p = expect(test.runA(10)).resolves.toBe(666);
		ps.push(p);
		await sleep(5);

		p = expect(test.runA(10)).rejects.toThrow('[AsyncLock]');
		ps.push(p);

		await sleep(15);

		expect(test.A).toHaveBeenCalledTimes(1);

		await Promise.all(ps);
	});
	it('deny different call', async () => {
		const ps = [];
		let p;
		const test = new Test();
		p = expect(test.runA(10)).resolves.toBe(666);
		ps.push(p);
		await sleep(5);

		p = expect(test.runB(10)).rejects.toThrow('[AsyncLock]');
		ps.push(p);

		await sleep(15);

		expect(test.A).toHaveBeenCalledTimes(1);

		await Promise.all(ps);
	});
	it('allow weak call', async () => {
		const ps = [];
		let p;
		const test = new Test();
		p = expect(test.runC1(10)).resolves.toBe(666);
		ps.push(p);
		await sleep(5);

		p = expect(test.runC2(10)).resolves.toBe(undefined);
		ps.push(p);

		await sleep(15);

		expect(test.C1).toHaveBeenCalledTimes(1);
		expect(test.C2).toHaveBeenCalledTimes(0);

		await Promise.all(ps);
	});
	it('this should exists', async () => {
		const test = new Test();
		expect(test.testThis()).resolves.toBeInstanceOf(Test);
	});
});
