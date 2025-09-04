import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { processPromise, processQuitPromise, type IToRun } from './fork.js';
import type { IStatusReport } from './outputStreams.js';

interface IState {
	readonly promise: Promise<void>;
	readonly cp: ChildProcess;
}

/** @extern */
export class I7zHandler extends EventEmitter {
	private state?: IState;
	private _timer?: NodeJS.Immediate;

	/** @internal */
	constructor(private readonly toRun: IToRun) {
		super();

		this._timer = setImmediate(() => {
			this._timer = undefined;
			this._start();
		});
	}

	private _start() {
		if (this.state) {
			return this.state;
		}
		this.hold();
		const cp = this.toRun.execute(
			(data) => {
				this.emit('output', data);
			},
			(status) => {
				this.emit('progress', status);
			},
		);

		const promise = processPromise(cp, this.commandline, this.cwd).catch((e) => e);

		this.state = { promise, cp };
		return this.state;
	}

	override on(event: 'progress', cb: (progress: IStatusReport) => void): this;
	override on(event: 'output', cb: (data: string) => void): this;
	override on(event: string, cb: (...args: any[]) => void): this {
		return super.on(event, cb);
	}

	hold() {
		if (this.state) {
			throw new Error('You cannot hold after leaved the event loop which created this object.');
		}
		if (this._timer) {
			clearImmediate(this._timer);
			this._timer = undefined;
		}
	}

	async cancel(): Promise<void> {
		if (this.state) {
			return processQuitPromise(this.state.cp);
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
		const state = this.state ?? this._start();
		return Promise.resolve(state.promise).then((e: any) => {
			if (e instanceof Error) {
				throw e;
			}
		});
	}
}
