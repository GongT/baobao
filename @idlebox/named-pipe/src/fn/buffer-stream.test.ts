import { noop, sleep } from '@idlebox/common';
import { streamPromise } from '@idlebox/node';
import { Writable, type Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { BufferStream } from './buffer-stream.js';

class MockWritableStream extends Writable {
	public readonly fn = vi.fn();

	constructor() {
		super({ objectMode: true });
		this.addListener('error', noop);
	}

	override _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
		this.fn(chunk.toString());
		callback();
	}
}

function end(stream: Writable | Readable): Promise<void> {
	const p = streamPromise(stream).catch(noop);
	if ('end' in stream) {
		stream.end();
	} else if ('push' in stream) {
		stream.push(null);
	}
	return p;
}

describe('buffer-stream', () => {
	it('可以正常写入', async () => {
		const target = new MockWritableStream();
		const bufferStream = new BufferStream();

		bufferStream.pipe(target);

		bufferStream.write('hello');
		bufferStream.write('world');

		await end(bufferStream);

		expect(target.fn).toHaveBeenCalledWith('hello');
		expect(target.fn).toHaveBeenCalledWith('world');
		expect(target.fn).toHaveBeenCalledTimes(2);
	});

	it('可以缓存数据', async () => {
		const target = new MockWritableStream();
		const bufferStream = new BufferStream();

		bufferStream.write('hello');
		bufferStream.write('world');

		bufferStream.pipe(target);

		await end(bufferStream);

		expect(target.fn).toHaveBeenCalledWith('hello');
		expect(target.fn).toHaveBeenCalledWith('world');
		expect(target.fn).toHaveBeenCalledTimes(2);
	});

	it('目标失败时不能丢失数据', async () => {
		const brokenTarget = new MockWritableStream();
		brokenTarget.destroy(new Error('目标流失败'));

		const target = new MockWritableStream();
		const bufferStream = new BufferStream();

		bufferStream.write('hello');

		bufferStream.pipe(brokenTarget);

		await sleep(100);

		bufferStream.write('world');

		bufferStream.pipe(target);

		await end(bufferStream);

		expect(target.fn).toHaveBeenCalledWith('hello');
		expect(target.fn).toHaveBeenCalledWith('world');
		expect(target.fn).toHaveBeenCalledTimes(2);
	});
});
