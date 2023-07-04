import { platform } from 'os';
import { Transform } from 'stream';
import { decodeStream } from 'iconv-lite';
import split2 from 'split2';

const isWin = platform() === 'win32';
/**aaa*/
function transformOutputEncode(source: NodeJS.ReadableStream): NodeJS.ReadableStream {
	return isWin ? source.pipe(decodeStream('936')) : source;
}

/**
 * aaaaa
 * @xxx
 * bbb
 **/
class BackspaceNewlineStream extends Transform {
	override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: Function): void {
		const str = chunk
			.toString('utf8')
			.replace(/[\x08\x0d]+/g, '\n')
			.replace(/^ +| +$/g, '');
		this.push(str, 'utf8');
		callback();
	}
}

class FilterStream extends Transform {
	constructor() {
		super({ objectMode: true });
	}

	override _transform(chunk: Buffer | string, encoding: BufferEncoding, callback: Function): void {
		if (typeof chunk !== 'string') {
			chunk = chunk.toString(encoding);
		}
		chunk = chunk.trim();
		if (chunk.length) {
			this.push(chunk);
		}
		callback();
	}
}

const matchExp = /^(\d+[%M])(?: - )?(.*)$/;

/** @extern */
export interface IStatusReport {
	messageOnly?: boolean;
	progress: number;
	message: string;
}

class ProgressStream extends Transform {
	constructor(private readonly message: boolean) {
		super({ objectMode: true });
	}

	override _transform(chunk: string, _encoding: BufferEncoding, callback: Function): void {
		const match = matchExp.exec(chunk);
		if (match) {
			const percent = parseInt(match[1]!);
			if (!isNaN(percent)) {
				this.push({
					progress: percent,
					message: match[2] || '',
				} as IStatusReport);
			}
		} else if (this.message) {
			this.push({
				messageOnly: true,
				message: chunk,
			} as IStatusReport);
		}
		callback();
	}
}

export function handleOutput(stream: NodeJS.ReadableStream) {
	return transformOutputEncode(stream).pipe(split2()).pipe(new FilterStream());
}

export function handleProgress(stream: NodeJS.ReadableStream, message: boolean) {
	return transformOutputEncode(stream)
		.pipe(new BackspaceNewlineStream())
		.pipe(split2())
		.pipe(new FilterStream())
		.pipe(new ProgressStream(message));
}

export class LoggerStream extends Transform {
	constructor(private pp: string) {
		super({ objectMode: true });
	}

	override _transform(chunk: string, encoding: BufferEncoding, callback: Function): void {
		console.error(`${this.pp}: ${chunk}`);
		this.push(chunk, encoding);
		callback();
	}
}
