/// <reference types="@types/heft-jest" />

import { mkdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { appendFile } from 'fs/promises';
import { resolve } from 'path';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { md5buff } from '../helper.test.d/testlib.js';
import { CacheFile, FileDataError, FileStructureError } from './CacheFile.js';

const tmpdir = resolve(process.cwd(), 'temp/my-test');
mkdirSync(tmpdir, { recursive: true });

const exampleMetadata = { a: 1, b: true };
const magic1 = 19,
	start = 8,
	size = 8,
	md5len = 16,
	meta = Buffer.from(JSON.stringify(exampleMetadata)).byteLength,
	magic2 = 19;
const firstStart = magic1 + size + meta + magic1 + magic2 + start + md5len + size;
const exampleStruct = [
	{
		start: 123,
		length: 24,
		hash: md5buff(Buffer.from('aaaaaaaaaabbbbbbbbbbbbbb')),
		fileOffset: firstStart,
	},
	{
		start: 500,
		length: 1000,
		hash: md5buff(Buffer.alloc(1000, 'c')),
		fileOffset: firstStart + 24 + magic2 + start + md5len + size,
	},
];
async function createExample(rw: CacheFile) {
	await rw.openRead();
	await rw.prepareCreate(exampleMetadata);
	await rw.writePart({ buffers: [Buffer.alloc(10, 'a'), Buffer.alloc(14, 'b')], start: 123 });
	await rw.writePart({ buffers: [Buffer.alloc(1024 - 24, 'c')], start: 500 });
}

describe('CacheFile', () => {
	describe('exist filter', () => {
		const testFile = resolve(tmpdir, 'cache-file-test-1.bin');
		rmSync(testFile, { force: true });

		it('not append if not exists', async () => {
			const rw = new CacheFile(testFile);

			await rw.openRead();
			expect(rw.isExists()).toBe(false);

			await expect(rw.prepareAppend()).rejects.toThrowError('ENOENT');

			await rw.dispose();
		});

		it('not create if exists', async () => {
			writeFileSync(testFile, 'aaaa');
			const rw = new CacheFile(testFile);
			await expect(rw.prepareCreate({ a: 1 })).rejects.toThrowError('EEXIST');
		});
	});

	describe('normal read/write', () => {
		const testFile = resolve(tmpdir, 'cache-file-test-2.bin');
		rmSync(testFile, { force: true });

		it('should able to create', async () => {
			// console.log(' == should able to create ==');

			const rw = new CacheFile(testFile);
			await createExample(rw);

			expect(rw.parts).toEqual(exampleStruct);
			expect(rw.metaJson).toEqual(exampleMetadata);

			await rw.dispose();
		});

		it('should filter args', async () => {
			// console.log(' == should filter args ==');
			const rw = new CacheFile(testFile);
			await rw.prepareAppend();
			await expect(rw.writePart({ buffers: [], start: 321 })).rejects.toThrowError('invalid');
			await expect(rw.writePart({ buffers: [Buffer.allocUnsafe(10)], start: -1 })).rejects.toThrowError(
				'invalid'
			);
			await expect(rw.writePart({ buffers: [Buffer.allocUnsafe(0)], start: 333 })).rejects.toThrowError(
				'invalid'
			);
			await rw.closeWriter();
		});

		it('should successfull read', async () => {
			const rw = new CacheFile(testFile);
			await rw.openRead();
			expect(rw.parts).toEqual(exampleStruct);
			expect(rw.metaJson).toEqual(exampleMetadata);
			await rw.dispose();
		});

		it('can emit', async () => {
			// console.error(' == can emit ==');
			const rw = new CacheFile(testFile);
			await rw.openRead();

			const emitter = await rw.startEmitting();
			for (const part of rw.parts) {
				const stream = emitter.stream(part.fileOffset, part.length);
				await pipeline(stream, new Blackhole());
			}

			await rw.dispose();
		});
	});

	describe('invliad struct', () => {
		const testFile = resolve(tmpdir, 'cache-file-test-3.bin');
		it('FileStructureError on invalid header', async () => {
			writeFileSync(testFile, 'aaaa');
			const rw = new CacheFile(testFile);
			await expect(rw.openRead()).rejects.toThrowError(FileStructureError);
			await rw.dispose();
			rmSync(testFile, { force: true });
		});

		it('ingore final invalid data', async () => {
			const rw = new CacheFile(testFile);
			await createExample(rw);
			await rw.dispose();
			const rightSize = statSync(testFile).size;

			await appendFile(testFile, Buffer.alloc(1, 0xff));
			expect(statSync(testFile).size).toBe(rightSize + 1);

			const rw1 = new CacheFile(testFile);
			await expect(rw1.openRead()).rejects.toThrowError(FileDataError);
			expect(rw1.isExists()).toBe(true);
			expect(rw1.parts).toEqual(exampleStruct);
			expect(rw1.metaJson).toEqual(exampleMetadata);
			await rw1.dispose();

			expect(statSync(testFile).size).toBe(rightSize);

			await appendFile(testFile, Buffer.alloc(500, 0xff));
			expect(statSync(testFile).size).toBe(rightSize + 500);

			const rw2 = new CacheFile(testFile);
			await expect(rw2.openRead()).rejects.toThrowError(FileDataError);
			expect(rw2.isExists()).toBe(true);
			expect(rw2.parts).toEqual(exampleStruct);
			expect(rw2.metaJson).toEqual(exampleMetadata);
			await rw2.dispose();

			expect(statSync(testFile).size).toBe(rightSize);
		});
	});

	describe('mark bad sections', () => {
		const testFile = resolve(tmpdir, 'cache-file-test-4.bin');
		rmSync(testFile, { force: true });
		const test = Buffer.alloc(1000, 'a');

		it('works', async () => {
			const rw = new CacheFile(testFile);
			await rw.prepareCreate({});

			await rw.writePart({ buffers: [test], start: 0 });
			await rw.writePart({ buffers: [test], start: 1 });
			await rw.writePart({ buffers: [test], start: 2 });
			await rw.writePart({ buffers: [test], start: 3 });

			await rw.closeWriter();

			const toPart = rw.parts[2];

			rw.markBad(toPart);
			expect(rw.parts.length).toBe(3);
			expect(rw.parts.find((e) => e.start === 2)).toBeFalsy();

			expect(() => rw.markBad(toPart)).toThrowError('not found');

			await rw.commitBadBlock();

			await rw.dispose();
		});

		it('can read back', async () => {
			const rw = new CacheFile(testFile);

			await rw.openRead();

			expect(rw.parts.length).toBe(3);
		});
	});
});

class Blackhole extends Writable {
	override _write(chunk: Buffer, _: any, callback: (error?: Error | null | undefined) => void): void {
		console.log('[test] write chunk %s bytes', chunk.byteLength);
		callback();
	}
}
