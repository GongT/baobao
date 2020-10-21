import { registerGlobalLifecycle } from '@idlebox/common';
import { FSWatcher } from 'chokidar';
export { FSWatcher } from 'chokidar';

const log = require('debug')('chokidar');

enum State {
	// nothing happen
	IDLE,
	// running callback
	BUSY,
	// debounce
	SCHEDULE,
	// change during callback, rerun callback after it done
	RESCHEDULE,
}

export class WatchHelper implements IWatchHelper {
	private _watches = new Set<string>();
	private state = State.IDLE;

	protected debounceMs = 800;
	private lastRun?: Promise<void>;
	private changes = new Set<string>();

	constructor(private readonly watcher: FSWatcher, private readonly onChange: IReloadFunction) {
		this.realTrigger = this.realTrigger.bind(this);
		const change = this.handleChange.bind(this);
		watcher.on('add', change);
		watcher.on('change', change);
	}

	private _debounce?: NodeJS.Timeout;
	private debounce() {
		if (this._debounce) {
			clearTimeout(this._debounce);
			this._debounce = undefined;
		}
		this._debounce = setTimeout(this.realTrigger, this.debounceMs);
	}

	private changeState(s: State) {
		log('state change: ' + State[s]);
		this.state = s;
	}

	private handleChange(path: string) {
		log('file changes: %s', path);
		this.changes.add(path);
		switch (this.state) {
			case State.IDLE:
				this.changeState(State.SCHEDULE);
				this.debounce();
				return;
			case State.SCHEDULE:
				this.debounce();
				return;
			case State.BUSY:
				this.changeState(State.RESCHEDULE);
				return;
			case State.RESCHEDULE:
				return;
			default:
				throw new Error('Invalid program state. ' + this.state);
		}
	}

	private realTrigger() {
		log('trigger...');

		const changes = [...this.changes.values()];
		this.changes.clear();
		log('    %s files change', changes.length);

		this.changeState(State.BUSY);
		this.lastRun = Promise.resolve()
			.then(() => {
				this.onChange(changes);
			})
			.catch((e) => {
				log('Failed callback: %s', e.stack);
			})
			.finally(() => {
				if (this.state === State.RESCHEDULE) {
					this.realTrigger();
				} else if (this.state === State.BUSY) {
					this.changeState(State.IDLE);
				} else {
					const e = new Error('Invalid program state. ' + this.state);
					setImmediate(() => {
						throw e;
					});
				}
				delete this.lastRun;
			});
	}

	addWatch(newWatch: string) {
		if (!this._watches.has(newWatch)) {
			this.watcher.add(newWatch);
			this._watches.add(newWatch);
		}
	}
	delWatch(oldWatch: string) {
		if (!this._watches.has(oldWatch)) {
			this.watcher.unwatch(oldWatch);
			this._watches.delete(oldWatch);
		}
	}

	reset() {
		this.watcher.unwatch([...this._watches.values()]);
	}

	get watches(): ReadonlyArray<string> {
		return [...this._watches.values()];
	}

	dispose(): Promise<void> {
		return Promise.all([this.watcher.close(), this.lastRun]).then();
	}
}

export interface IWatchHelper {
	addWatch(newWatch: string): void;
	delWatch(oldWatch: string): void;
	reset(): void;
	dispose(): Promise<void>;
	watches: ReadonlyArray<string>;
}

interface IReloadFunction {
	(changes: string[]): void | Promise<void>;
}

export function startChokidar(reload: IReloadFunction): IWatchHelper {
	const w = new WatchHelper(
		new FSWatcher({
			ignoreInitial: true,
		}),
		reload
	);
	registerGlobalLifecycle(w);
	return w;
}
