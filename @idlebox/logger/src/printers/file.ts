import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { Transform, type TransformCallback } from 'node:stream';

export function createLogFile(filePath: string): NodeJS.WritableStream {
	const file = resolve(process.cwd(), filePath);
	console.log(`Creating log file: ${file}`);
	const target = createWriteStream(file, { autoClose: true, encoding: 'utf-8', flush: true });
	target.on('error', (err) => {
		console.error(`Error writing to log file ${file}:`, err);
	});
	target.on('open', (fd) => {
		console.error(`log file ${file}:`, fd);
	});
	target.on('close', () => {
		console.error(`log file ${file}: close`);
	});
	const filter = new ColorRemoveStream();
	filter.pipe(target, { end: true });

	return filter;
}

class ColorRemoveStream extends Transform {
	override _transform(chunk: Buffer, _encoding: string, callback: TransformCallback): void {
		const cleaned = chunk.toString().replace(/\x1B\[[0-9;]*m/g, '');
		callback(null, cleaned);
	}
}
