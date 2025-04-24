import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { type IToRun, processPromise, processQuitPromise } from './fork.js';
import type { IStatusReport } from './outputStreams.js';

/** @extern */
export class I7zHandler extends EventEmitter {
	private _promise?: Promise<void>;
	private _timer?: NodeJS.Immediate;
	private cp?: ChildProcess;

	/** @internal */
	constructor(private readonly toRun: IToRun) {
		super();

		this._timer = setImmediate(() => {
			this._timer = undefined;
			this._start();
		});
	}

	private _start() {
		if (this._promise) {
			return;
		}
		this.hold();
		this.cp = this.toRun.execute(
			(data) => {
				this.emit('output', data);
			},
			(status) => {
				this.emit('progress', status);
			}
		);

		this._promise = processPromise(this.cp, this.commandline, this.cwd).catch((e) => e);
	}

	override on(event: 'progress', cb: (progress: IStatusReport) => void): this;
	override on(event: 'output', cb: (data: string) => void): this;
	override on(event: string, cb: (...args: any[]) => void): this {
		return super.on(event, cb);
	}

	hold() {
		if (this._promise) {
			throw new Error('You cannot hold after leaved the event loop which created this object.');
		}
		if (this._timer) {
			clearImmediate(this._timer);
			this._timer = undefined;
		}
	}

	async cancel(): Promise<void> {
		if (this._promise) {
			return processQuitPromise(this.cp!);
		}
		return this.hold();
	}

	public get commandline() {
		return this.toRun.commandline;
	}

	public get cwd() {
		return this.toRun.cwd;
	}

	promise(): Promise<void> {
		if (!this._promise) {
			this._start();
		}
		return Promise.resolve(this._promise).then((e: any) => {
			if (e instanceof Error) {
				throw e;
			}
		});
	}
}
