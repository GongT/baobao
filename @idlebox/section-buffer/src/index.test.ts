/// <reference types="@types/heft-jest" />

import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { sleep } from '@idlebox/common';
import { mb, md5, randomTestFile, tmpdir } from './helper.test.d/testlib.js';
import { SectionBuffer } from './index.js';

const testFile = resolve(tmpdir, 'index-cache.bin');
const targetFile = resolve(tmpdir, 'index-output.bin');
const exampleFile = resolve(tmpdir, 'index-example.bin');

const test100 = randomTestFile(exampleFile, 100 * mb);
const hash = md5(test100);

function wrapFunction(instance: any, name: string) {
	const orig = instance[name];
	const fn = (...args: any[]) => {
		// console.log(' --> %s is called:', name, ...args);
		return orig.apply(instance, args).then(
			(ret: any) => {
				// console.log(' <-- %s is return:', name, ret);
				return ret;
			},
			(e: any) => {
				// console.log(' <-- %s is throw:', name, e.message);
				throw e;
			}
		);
	};
	instance[name] = jest.fn(fn);
	return instance[name];
}

// const clsPt = SectionBuffer.prototype as any;
function patchInstance(instance: SectionBuffer<any>) {
	const trigger = wrapFunction(instance, 'trigger');
	const flushCacheReal = wrapFunction(instance, '__flushCacheReal');
	const rebuildFinalFile = wrapFunction(instance, '__rebuildFinalFile');
	return { trigger, flushCacheReal, rebuildFinalFile };
}
function getSyncTimer(instance: SectionBuffer<any>) {
	return (instance as any)._timer;
}

describe('SectionBuffer', () => {
	rmSync(testFile, { force: true });
	// rmSync(targetFile, { force: true });

	it('should trigger timer', async () => {
		// console.log(' == should create read instance == ');
		const instance = new SectionBuffer<{ etag: string }>({
			cacheFile: testFile,
			fileSize: 100 * mb,
			metadata: { etag: hash },
			targetFile,
			syncInterval: 50,
			syncSize: 50 * mb,
		});
		const { trigger, flushCacheReal, rebuildFinalFile } = patchInstance(instance);
		await expect(instance.start()).resolves.toBe(false);
		expect(getSyncTimer(instance)).toBeTruthy();

		expect(trigger).toBeCalledTimes(0);
		await sleep(120);
		expect(trigger).toBeCalledTimes(2);
		expect(flushCacheReal).toBeCalledTimes(1);

		await instance.dispose();
		expect(getSyncTimer(instance)).toBeFalsy();

		expect(trigger).toBeCalledTimes(3);
		expect(flushCacheReal).toBeCalledTimes(2);
		expect(rebuildFinalFile).toBeCalledTimes(0);
	});

	it('should not sync during force flush', async () => {
		// console.log(' == should not sync during force flush == ');
		const instance = new SectionBuffer({
			cacheFile: testFile,
			fileSize: 100 * mb,
			metadata: { etag: hash },
			targetFile,
			syncInterval: 5000,
			syncSize: 50 * mb,
		});
		const { trigger, flushCacheReal } = patchInstance(instance);

		await expect(instance.start()).resolves.toBe(true);

		instance.push({ buffer: test100.subarray(0, 100), start: 0 });
		instance.forceSync();
		instance.push({ buffer: test100.subarray(0, 100), start: 100 });
		instance.push({ buffer: test100.subarray(0, 100), start: 200 });

		expect(trigger).toBeCalledTimes(0);

		await sleep(0);
		expect(trigger).toBeCalledTimes(1);

		await sleep(100);

		expect(trigger).toBeCalledTimes(1);
		expect(flushCacheReal).toBeCalledTimes(1);

		await instance.dispose();

		rmSync(testFile, { force: true });
	});

	it('able to write', async () => {
		// console.log('\x1Bc == able to write == ');
		const instance = new SectionBuffer({
			cacheFile: testFile,
			fileSize: 100 * mb,
			metadata: { etag: hash },
			targetFile,
			syncInterval: 10000,
			syncSize: 50 * mb,
		});
		const { flushCacheReal, rebuildFinalFile } = patchInstance(instance);
		await expect(instance.start()).resolves.toBe(false);

		instance.push({ buffer: test100.subarray(0, 25 * mb), start: 0 });
		await sleep(10);
		instance.push({ buffer: test100.subarray(25 * mb, 50 * mb), start: 25 * mb });
		await sleep(5);
		instance.push({ buffer: test100.subarray(50 * mb, 75 * mb), start: 50 * mb });
		await sleep(100);
		instance.push({ buffer: test100.subarray(75 * mb, 100 * mb), start: 75 * mb });
		await sleep(200);

		await instance.sync();

		expect(getSyncTimer(instance)).toBeFalsy();

		await instance.dispose();

		expect(flushCacheReal).toBeCalledTimes(1);
		expect(rebuildFinalFile).toBeCalledTimes(1);
	}, 10000);

	it('file shoud be same', () => {
		const f = readFileSync(targetFile);
		const got = md5(f);

		expect(got).toBe(hash);
	}, 5000);
});
