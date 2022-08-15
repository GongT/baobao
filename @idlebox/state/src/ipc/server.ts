import { AsyncCallbackList } from '@idlebox/common';
import { Baobab, Cursor, Watcher } from 'baobab';
import {
	createDataMessage,
	IMessage,
	IPCServerDriver,
	isEventMessage,
	isSubscribeAfterMessage,
	isSubscribeMessage,
	isUnsubscribeMessage,
} from './protocol';

let watcherIdInc = 0;

type WatchList = Map<number, Watcher>;
interface ILinkMeta {
	watchList: WatchList;
	readonly channel: IPCServerDriver;
}

type StateModifier = Pick<
	Cursor,
	'set' | 'unset' | 'push' | 'unshift' | 'concat' | 'pop' | 'shift' | 'splice' | 'apply' | 'merge' | 'deepMerge'
>;

interface IStateMasterOptions {
	debug(message: string, ...args: any[]): void;
}
const defaultOptions: IStateMasterOptions = { debug: () => {} };

/**
 * 状态对象存储
 * @public
 */
export class StateMaster {
	private readonly children = new Set<IPCServerDriver>();
	private eventHandlers = new Map<string, AsyncCallbackList<[any, StateModifier]>>();

	/** @private */
	constructor(public readonly state: Baobab, private readonly options: IStateMasterOptions = defaultOptions) {}

	/**
	 * 注册一个订阅者
	 * @param child 通讯对象
	 */
	attach(child: IPCServerDriver) {
		this.options.debug('[IPC] channel %s connected', child.title);

		const linkMeta: ILinkMeta = {
			watchList: new Map(),
			channel: child,
		};

		this.children.add(child);
		child.handle((message) => this.handle(message, linkMeta));
		child.onBeforeDispose(() => {
			this.options.debug('[IPC] channel %s disconnected', child.title);
			linkMeta.watchList.forEach((watcher) => watcher.release());
			this.children.delete(child);
		});
	}

	/**
	 * 注册数据处理事件
	 * @param eventName
	 * @param callback
	 */
	on(eventName: string, callback: (payload: any, state: StateModifier) => void | Promise<void>) {
		if (!this.eventHandlers.has(eventName)) {
			this.eventHandlers.set(eventName, new AsyncCallbackList());
		}
		this.eventHandlers.get(eventName)!.add(callback);
	}

	private async handle(message: IMessage, linkMeta: ILinkMeta) {
		if (isEventMessage(message)) {
			await this.eventHandlers.get(message.event)?.run(message.payload, this.state);
		} else if (isSubscribeMessage(message)) {
			return this.subscribe(message.subscribe, linkMeta.channel, linkMeta.watchList);
		} else if (isSubscribeAfterMessage(message)) {
			return this.getWatchedValue(message.subscribeId, linkMeta.watchList);
		} else if (isUnsubscribeMessage(message)) {
			return this.unsubscribe(message.subscribeId, linkMeta.watchList);
		} else {
			this.options.debug('invalid message payload: %j', message);
		}
	}

	protected getWatchedValue(id: number, watchList: WatchList): Record<string, any> {
		const watcher = watchList.get(id);
		if (!watcher) {
			throw new Error('get watched value, but not watching: ' + id);
		}
		return watcher.get();
	}

	protected subscribe(subscribe: Record<string, string[]>, channel: IPCServerDriver, watchList: WatchList): number {
		this.options.debug('[IPC] %s subscribe [%s]', channel.title, Object.keys(subscribe));
		const id = watcherIdInc++;
		const newWathcer = this.state.watch(subscribe);
		watchList.set(id, newWathcer);

		newWathcer.on('update', function () {
			channel.call(createDataMessage(id, newWathcer.get()));
		});

		return id;
	}
	protected unsubscribe(subscribeId: number, watchList: WatchList): void {
		this.options.debug('[IPC] %s unsubscribe', subscribeId);
		if (watchList.has(subscribeId)) {
			throw new Error('delete not exists watch id ' + subscribeId);
		}
		watchList.get(subscribeId)!.release();
		watchList.delete(subscribeId);
	}
}
