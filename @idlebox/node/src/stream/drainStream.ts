export function drainStream(stream: NodeJS.ReadableStream, size: number, start = 0, extra = 0): Promise<Buffer> {
	// buff will alloc as start+size+extra, but return will always start+RealStreamSize+extra
	const buff = Buffer.allocUnsafe(start + size + extra);
	let cur = start;
	return new Promise<Buffer>((resolve, reject) => {
		stream.once('error', (err) => reject(err));
		stream.on('data', (data: Buffer) => {
			cur += data.copy(buff, cur);
		});
		stream.on('close', () => {
			resolve(buff);
		});
	});
}

/**
 * 等待一个可写流的drain事件，或者close事件
 * 或者error事件reject
 *
 * 如果当前就是可写的，直接返回true
 * 如果发生了等待，返回false
 *
 * @param stream
 * @returns true if the stream is currently writable, false if it is waitted
 */
export function drainWriteStream(stream: NodeJS.WritableStream): Promise<boolean> | boolean {
	if (stream.write('')) return true;

	return new Promise<boolean>((resolve, reject) => {
		stream.once('error', (err) => reject(err));
		stream.on('close', () => {
			resolve(false);
		});
		stream.on('drain', () => {
			resolve(false);
		});
	});
}
