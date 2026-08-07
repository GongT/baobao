import { commandInPath, osTempDir, RawCollectingStream } from '@idlebox/node';
import { execa } from 'execa';
import { randomBytes } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createNamedPipe, type INamedPipe } from '../index.js';

const tempDir = osTempDir('named-pipe-test-write');
beforeAll(async () => {
	expect(await commandInPath('cat'), '缺少cat命令').toBeTruthy();
	expect(await commandInPath('tail'), '缺少tail命令').toBeTruthy();

	await mkdir(tempDir, { recursive: true });
});
afterAll(async () => {
	await rm(tempDir, { recursive: true });
});
function rnd() {
	return resolve(tempDir, randomBytes(4).toHex());
}

class CatReader {
	private readonly p;
	private readonly collector = new RawCollectingStream();
	public readonly promise: Promise<Buffer>;

	constructor(pipe: string) {
		this.p = execa({ stdio: ['ignore', 'pipe', 'pipe'], encoding: 'buffer', reject: false })`cat ${pipe}`;
		this.collector = this.p.stdout.pipe(new RawCollectingStream());
		this.promise = this.p.then((r) => {
			if (r.stderr.length) {
				throw new Error(`cat exited with stderr: "${r.stderr.toString()}"`);
			}
			return this.collector.promise();
		});
	}

	get output() {
		return this.collector.getOutput();
	}

	async [Symbol.asyncDispose]() {
		await this.kill();
	}

	kill() {
		this.p.kill('SIGINT');
		return this.promise;
	}

	poll(equals: Buffer | string) {
		const reject = new Promise<void>((_, reject) => {
			this.promise.catch(reject);
		});

		let p;
		if (typeof equals === 'string') {
			p = expect.poll<any>(() => this.output.toString()).toStrictEqual(equals);
		} else {
			p = expect.poll<any>(() => this.output).toEqual(equals);
		}

		return Promise.race([p, reject]);
	}
}

class TailReader {
	private readonly p;
	private readonly collector = new RawCollectingStream();
	private ending = Promise.withResolvers<void>();

	constructor(pipe: string) {
		this.p = execa({ stdio: ['ignore', 'pipe', 'pipe'], encoding: 'buffer', reject: false })`tail -f ${pipe}`;
		this.p.stdout.pipe(this.collector);
		this.p.then((r) => {
			if (r.stderr.length) {
				this.ending.reject(new Error(`tail exited with stderr: ${r.stderr}`));
			} else {
				this.ending.resolve();
			}
		});
	}

	async [Symbol.asyncDispose]() {
		this.p.kill();
		await this.ending.promise;
	}

	get output() {
		return this.collector.getOutput();
	}

	get promise() {
		return this.ending.promise;
	}
}

function readerSuite(name: string, fn: (pipe: INamedPipe, reader: TailReader) => Promise<void>) {
	it(name, async () => {
		await using pipe = createNamedPipe(rnd());

		await pipe.create();

		await using reader = new TailReader(pipe.name);
		const test = fn(pipe, reader);

		await Promise.race([test, reader.promise]);
	});
}

describe('作为写入端', () => {
	readerSuite('写入数据', async (pipe, reader) => {
		const writer = await pipe.write();

		writer.write('hello\n');
		writer.end('world\n');

		await expect.poll(() => reader.output.toString()).toBe('hello\nworld\n');
	});

	readerSuite('写入二进制数据', async (pipe, reader) => {
		const writer = await pipe.write();

		writer.write(Buffer.from([0x01, 0x02, 0x03]));
		writer.end(Buffer.from([0x04, 0x05, 0, 0x06]));

		await expect.poll(() => reader.output).toEqual(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0, 0x06]));
	});

	it('中断读取', async () => {
		await using pipe = createNamedPipe(rnd());

		await pipe.create();

		const reader = new CatReader(pipe.name);
		const writer = await pipe.write();

		writer.write('hello\n');
		writer.write('world\n');

		await reader.poll(Buffer.from('hello\nworld\n'));
		await reader.kill();

		await using reader2 = new CatReader(pipe.name);

		setTimeout(() => {
			writer.write('test\n');
			writer.end('again\n');
		}, 0);

		await expect(reader2.promise).resolves.toEqual(Buffer.from('test\nagain\n'));
	});
});
