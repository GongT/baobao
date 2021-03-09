import { AsyncCallbackList } from '@idlebox/common';
import { Baobab, Cursor, Watcher } from 'baobab';
import {
	createDataMessage,
	IMessage,
	IPCServerDriver,
	isEventMessage,
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

export class StateMaster {
	private readonly children = new Set<IPCServerDriver>();
	private eventHandlers = new Map<string, AsyncCallbackList<[any, StateModifier]>>();

	constructor(public readonly state: Baobab) {}

	attach(child: IPCServerDriver) {
		console.log('[IPC] channel %s connected', child.title);

		const linkMeta: ILinkMeta = {
			watchList: new Map(),
			channel: child,
		};

		this.children.add(child);
		child.handle((message) => this.handle(message, linkMeta));
		child.onBeforeDispose(() => {
			console.log('[IPC] channel %s disconnected', child.title);
			linkMeta.watchList.forEach((watcher) => watcher.release());
			this.children.delete(child);
		});
	}

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
		} else if (isUnsubscribeMessage(message)) {
			return this.unsubscribe(message.subscribeId, linkMeta.watchList);
		} else {
			console.error('invalid message payload: %j', message);
		}
	}

	protected subscribe(subscribe: Record<string, string[]>, channel: IPCServerDriver, watchList: WatchList): number {
		console.log('[IPC] %s subscribe [%s]', channel.title, Object.keys(subscribe));
		const id = watcherIdInc++;
		const newWathcer = this.state.watch(subscribe);
		watchList.set(id, newWathcer);

		setTimeout(() => {
			channel.call(createDataMessage(id, newWathcer.get()));
			newWathcer.on('update', function () {
				channel.call(createDataMessage(id, newWathcer.get()));
			});
		}, 0);

		return id;
	}
	protected unsubscribe(subscribeId: number, watchList: WatchList): void {
		console.log('[IPC] %s unsubscribe', subscribeId);
		if (watchList.has(subscribeId)) {
			return console.warn('delete not exists watch id %s', subscribeId);
		}
		watchList.get(subscribeId)!.release();
		watchList.delete(subscribeId);
	}
}
