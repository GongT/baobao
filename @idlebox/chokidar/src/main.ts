import { FSWatcher, type ChokidarOptions } from 'chokidar';
import debug from 'debug';
import { join } from 'node:path';
import { deprecate } from 'node:util';
export { FSWatcher } from 'chokidar';

const log = debug('chokidar');

enum State {
	// nothing happen
	IDLE = 0,
	// running callback
	BUSY = 1,
	// debounce
	SCHEDULE = 2,
	// change during callback, rerun callback after it done
	RESCHEDULE = 3,
}

export class WatchHelper implements IWatchHelper {
	private state = State.IDLE;

	public debounceMs = 800;
	private lastRun?: Promise<void>;
	private changes = new Set<string>();
	private readonly cwd: string | undefined;
	private trackedFiles = new Set<string>();

	constructor(
		private readonly watcher: FSWatcher,
		private readonly onChange: IReloadFunction
	) {
		this.handler = this.handler.bind(this);

		this.cwd = watcher.options.cwd;
	}

	listen(item: (typeof allowedEvents)[number]) {
		if (!allowedEvents.includes(item)) {
			throw new Error(`not allowed watcher event name: ${item}`);
		}

		log('listen: %s [previous %d]', item, this.watcher.listenerCount(item));
		if (this.watcher.listenerCount(item) === 0) {
			this.watcher.addListener(item, (ch) => {
				this.lowlevel_handler(ch, item);
			});
		}
	}
	unlisten(item: (typeof allowedEvents)[number]) {
		if (!allowedEvents.includes(item)) {
			throw new Error(`not allowed watcher event name: ${item}`);
		}

		this.watcher.removeAllListeners(item);
	}

	private _debounce?: NodeJS.Timeout;
	private debounce() {
		if (this._debounce) {
			clearTimeout(this._debounce);
			this._debounce = undefined;
		}
		this._debounce = setTimeout(() => {
			this._debounce = undefined;
			this.handler();
		}, this.debounceMs);
	}

	private changeState(s: State) {
		log(`state change: ${State[s]}`);
		this.state = s;
	}

	private lowlevel_handler(path: string, event: WatchEventKind) {
		log('file changes: %s', path);
		if (path) {
			this.changes.add(path);
		}
		if (!this.changes.size && event !== 'ready') {
			return;
		}
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
				throw new Error(`Invalid program state. ${this.state}`);
		}
	}

	private handler() {
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
					this.handler();
				} else if (this.state === State.BUSY) {
					this.changeState(State.IDLE);
				} else {
					const e = new Error(`Invalid program state. ${this.state}`);
					setImmediate(() => {
						throw e;
					});
				}
				this.lastRun = undefined;
			});
	}

	get empty() {
		return Object.keys(this.watcher.getWatched()).length === 0;
	}

	get size() {
		let sum = 0;
		for (const item of Object.values(this.watcher.getWatched())) {
			sum += item.length;
		}
		return sum;
	}

	async replace(newList: readonly string[]) {
		const newSet = new Set(newList);
		for (const item of this.trackedFiles) {
			if (!newSet.has(item)) {
				this.delete(item);
			}
		}
		for (const item of this.watches) {
			if (!newSet.has(item)) {
				this.delete(item);
			}
		}

		this.add([...newSet]);

		/**
		 * 暂时没有办法得知删除操作是否完成
		 * 	可能遇到问题（不确定）：如果删除的项目中有目录，而添加的项目中有其子项，则可能因为异步顺序导致添加后立刻又删除
		 * 想不到怎么解决
		 */
		throw new Error('replace() is not implemented');
	}

	addWatch = deprecate(this.add.bind(this), 'use add instead of addWatch');
	delWatch = deprecate(this.delete.bind(this), 'use delete instead of delWatch');

	add(files: string | readonly string[]) {
		// console.log('[watch:add] %s', files)
		if (typeof files === 'string') {
			this.trackedFiles.add(files);
		} else {
			for (const file of files) {
				this.trackedFiles.add(file);
			}
		}
		this.watcher.add(files as string[]);
	}

	delete(files: string | readonly string[]) {
		// console.log('[watch:del] %s', files)
		if (typeof files === 'string') {
			this.trackedFiles.delete(files);
		} else {
			for (const file of files) {
				this.trackedFiles.delete(file);
			}
		}
		this.watcher.unwatch(files as string[]);
	}

	reset() {
		this.watcher.unwatch([...this.trackedFiles]);
		this.trackedFiles.clear();
		this.watcher.unwatch(this.watches);
	}

	get expectedWatches() {
		return [...this.trackedFiles];
	}

	get trackingSize() {
		return this.trackedFiles.size;
	}

	get watches(): string[] {
		const list = [];
		for (const [folder, files] of Object.entries(this.watcher.getWatched())) {
			for (const file of files) {
				if (this.cwd) {
					list.push(join(this.cwd, folder, file));
				} else {
					list.push(join(folder, file));
				}
			}
		}
		return list;
	}

	async dispose() {
		await Promise.all([this.watcher.close(), this.lastRun]);
	}
}

export interface IWatchHelper {
	/** @deprecated use add */
	addWatch(files: string | readonly string[]): void;
	/** @deprecated use delete */
	delWatch(files: string | readonly string[]): void;

	add(files: string | readonly string[]): void;
	delete(files: string | readonly string[]): void;
	replace(files: readonly string[]): Promise<void>;
	reset(): void;

	/** 注意: chokidar的api无法同步获取监听文件数量，这个数值不会实时的反映实际情况 */
	readonly size: number;
	/** 注意: chokidar的api无法同步获取监听文件数量，这个数值不会实时的反映实际情况 */
	readonly empty: boolean;

	/** 本地维护的文件列表，和实际不一定相符，比如 符号链接、文件删除自动取消监视 等情况均无法同步 */
	readonly trackingSize: number;
	readonly expectedWatches: string[];

	listen(item: (typeof allowedEvents)[number]): void;
	unlisten(item: (typeof allowedEvents)[number]): void;

	dispose(): Promise<void>;
	readonly watches: string[];
}

type IReloadFunction = (changes: string[]) => void | Promise<void>;
const allowedEvents = ['add', 'addDir', 'change', 'unlink', 'unlinkDir', 'ready'] as const;
export type WatchEventKind = (typeof allowedEvents)[number];

export interface IExtraOptions extends ChokidarOptions {
	debounceMs: number;
	watchingEvents: (typeof allowedEvents)[number][];
}

const defaultOptions: IExtraOptions = {
	ignoreInitial: true,
	debounceMs: 500,
	watchingEvents: ['add', 'change'],
};

export function startChokidar(reload: IReloadFunction, options: Partial<IExtraOptions> = {}): IWatchHelper {
	const { debounceMs, watchingEvents, ...opts } = Object.assign({}, defaultOptions, options);
	const watcher = new WatchHelper(new FSWatcher(opts), reload);
	watcher.debounceMs = debounceMs;
	for (const item of watchingEvents) {
		watcher.listen(item);
	}
	return watcher;
}
