import { Transform } from 'node:stream';

export type LogFunction = (message: string, ...args: any[]) => void;

export class LoggerStream extends Transform {
	private readonly prefix: string;

	constructor(
		private readonly logFn: LogFunction,
		prefix?: string
	) {
		super();
		this.prefix = prefix ? `${prefix} %s` : '%s';
	}

	override _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function): void {
		if ((encoding as any) === 'buffer' || encoding === 'binary') {
			encoding = undefined as any;
		}
		chunk
			.toString(encoding)
			.split(/\n/g)
			.forEach((l) => {
				if (l.length) {
					this.logFn(this.prefix, l);
				}
			});
		this.push(chunk, encoding);
		callback();
	}
}

function pad2(s: string) {
	return s.length === 1 ? `0${s}` : s;
}

export class HexDumpLoggerStream extends Transform {
	private readonly prefix: string;

	constructor(
		private readonly logFn: LogFunction,
		prefix?: string
	) {
		super();
		this.prefix = prefix ? `${prefix} ` : '';
	}

	override _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function): void {
		let itr = 0;
		while (chunk.length - itr > 0) {
			const l = Array.from(chunk.slice(itr, itr + 16))
				.map((e) => pad2(e.toString(16)).toUpperCase())
				.join(' ');
			itr += 16;

			const r = Array.from(chunk.slice(itr, itr + 16))
				.map((e) => pad2(e.toString(16)).toUpperCase())
				.join(' ');
			itr += 16;

			this.logFn(`${this.prefix + l}  ${r}`);
		}

		this.push(chunk, encoding);
		callback();
	}
}
