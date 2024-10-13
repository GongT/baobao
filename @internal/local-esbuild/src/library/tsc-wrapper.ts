import { execaNode, Options, Result, Subprocess } from 'execa';
import EventEmitter from 'node:events';
import { Writable } from 'node:stream';
import split2 from 'split2';

// [9:51:48 AM] Found 13 errors. Watching for file changes.
const matchEndingLine = /^\[.+\] Found (\d+) errors?/m;
// [9:51:48 AM] Starting compilation in watch mode
// [9:51:48 AM] File change detected. Starting incremental compilation...
const matchStartLine = /^\[.+\] (File change detected|Starting compilation in watch mode)/m;

const options = {
	stdin: 'ignore',
	stdout: 'pipe',
	stderr: 'pipe',
	buffer: false,
	encoding: 'utf8',
} satisfies Options;
type OptionsType = typeof options;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

interface EventMap {
	log: [string];
	debug: [string];
	finish: [Error | null];
	start: [/* is rebuild */ boolean];
}

export class TscWrapper extends EventEmitter<EventMap> {
	private readonly outputStream: NodeJS.WritableStream;
	private readonly process: Subprocess<OptionsType>;
	private _working = true;

	constructor(
		private readonly tsc: string,
		private readonly args: string[],
		private readonly workdir: string = process.cwd(),
	) {
		super();
		this.outputStream = this.createStream();
		this.process = this.createProcess();
	}

	private createProcess() {
		const process = execaNode(this.tsc, this.args, {
			cwd: this.workdir,
			// verbose: 'short',
			...options,
		});

		process.stdout.pipe(split2()).pipe(this.outputStream);
		process.stderr.pipe(split2()).pipe(this.outputStream);

		return process;
	}

	private createStream() {
		return new Writable({
			objectMode: true,
			write: (chunk: string, _, callback) => {
				const line = chunk.toString();
				callback();

				if (!line || !line.trim()) {
					this.emit('log', '');
					return;
				}

				if (matchEndingLine.test(line)) {
					this.emit('debug', line);
					this._working = false;

					const m = matchEndingLine.exec(line)!;
					if (m[1] === '0') {
						this.emit('finish', null);
					} else {
						this.emit('finish', new Error('compile failed'));
					}
				} else if (matchStartLine.test(line)) {
					this.emit('debug', line);
					this._working = true;
					this.emit('start', line.includes('File change detected'));
				} else {
					this.emit('log', line);
				}
			},
		});
	}

	async waitNextCompile(timeout = 1000) {
		if (!this._working) {
			const waitStart = new Promise<any>((resolve) => {
				this.once('start', resolve);
			});

			if (timeout) {
				await Promise.race([sleep(timeout), waitStart]);
			} else {
				await waitStart;
			}
			if (!this._working) {
				return false;
			}
		}

		const e = await new Promise<Error | null>((resolve) => {
			this.once('finish', resolve);
		});
		return e || true;
	}

	async waitQuit(): Promise<Result<OptionsType>> {
		return this.process as any;
	}

	async terminate() {
		this.process.kill();
		return this.waitQuit();
	}
}
