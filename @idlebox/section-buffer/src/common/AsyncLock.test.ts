/// <reference types="@types/heft-jest" />

import { sleep } from '@idlebox/common';
import { AsyncLock } from './AsyncLock.js';

function sleepJob(title: string) {
	return jest.fn(async (ms: number): Promise<number | undefined> => {
		console.log('[sleep] %s start', title);
		await sleep(ms);
		console.log('[sleep] %s stop', title);
		return 666;
	});
}

const A = sleepJob('A');
const B = sleepJob('B');
const C1 = sleepJob('C1');
const C2 = sleepJob('C2');

class Test {
	public readonly test = 1;

	@AsyncLock.protect('lA')
	A(ms: number) {
		return A(ms);
	}

	@AsyncLock.protect('lB')
	async B(ms: number) {
		return B(ms);
	}

	@AsyncLock.protect('lC', true)
	async C1(ms: number) {
		return C1(ms);
	}
	@AsyncLock.protect('lC', true)
	async C2(ms: number) {
		return C2(ms);
	}
	@AsyncLock.protect('this')
	async testThis(): Promise<this | undefined> {
		return this;
	}
}
describe('AsyncLock', () => {
	it('deny duplicate call', async () => {
		const test = new Test();
		expect(test.A(10)).resolves.toBe(666);
		await sleep(5);

		expect(test.A(10)).rejects.toThrowError('[AsyncLock]');

		await sleep(15);

		expect(A).toBeCalledTimes(1);
	});
	it('deny different call', async () => {
		const test = new Test();
		expect(test.A(10)).resolves.toBe(666);
		await sleep(5);

		expect(test.B(10)).rejects.toThrowError('[AsyncLock]');

		await sleep(15);

		expect(A).toBeCalledTimes(1);
	});
	it('allow weak call', async () => {
		const test = new Test();
		expect(test.C1(10)).resolves.toBe(666);
		await sleep(5);

		expect(test.C2(10)).resolves.toBe(undefined);

		await sleep(15);

		expect(C1).toBeCalledTimes(1);
		expect(C2).toBeCalledTimes(0);
	});
	it('this should exists', async () => {
		const test = new Test();
		expect(test.testThis()).resolves.toBeInstanceOf(Test);
	});
});
