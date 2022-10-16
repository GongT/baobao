import { DeepReadonly, EventRegister, MemorizedEmitter } from '@idlebox/common';
import { IMessage, IPCDriver, isDataMessage } from './protocol';

export class StateSlave {
	private subList = new Map<number, EventHelper<any>>();

	/** @private */
	constructor(private readonly channel: IPCDriver) {
		channel.handle((message) => this.handle(message));
	}

	/**
	 * 触发数据事件（在主存储处执行对应逻辑）
	 * @param event
	 * @param payload
	 */
	async trigger(event: string, payload: any) {
		await this.channel.call({
			action: 'event',
			event,
			payload,
		});
	}

	private async handle(message: IMessage) {
		if (isDataMessage(message)) {
			// console.error('[Slave] got update data!');
			if (!this.subList.has(message.watchId)) {
				console.error('not exists watch id: %s (current: %s)', message.watchId, [...this.subList.keys()]);
				return;
			}
			this.subList.get(message.watchId)!._onChange.fireNoError(message.payload);
		} else {
			console.error('invalid message payload: %j', message);
		}
	}

	/**
	 * 监视指定数据的修改（注意这个监听本身也是异步的）
	 *
	 * 只是调用这个函数，数据就会开始传输
	 *
	 * @public
	 * @param data 一个map，key是change事件触发时附带数据的key，value是要监视数据的path
	 * 例如 {a: ['b','c']}，则当 .b.c 从x变为1时，收到 {a: 1}
	 * @returns
	 */
	async subscribe<T>(data: Record<keyof T, string[]>): Promise<Pick<EventHelper<T>, 'onChange' | 'dispose'>> {
		const subId = await this.channel.call({
			action: 'subscribe',
			subscribe: data,
		});
		// console.log('[Slave] subId=%s', subId);
		const eh = new EventHelper<T>(subId, this.channel);
		this.subList.set(subId, eh);

		this.channel
			.call({
				action: 'subscribeAfter',
				subscribe: data,
			})
			.catch((e) => console.warn('[state:client] warn: subscribeAfter failed:', e));

		return eh;
	}

	async dispose() {
		for (const eh of this.subList.values()) {
			eh.stop();
		}
		await this.channel.call({ action: 'dispose' });
		await this.channel.dispose();
	}
}

class EventHelper<T> {
	/** @private */
	public readonly _onChange = new MemorizedEmitter<T>();

	/**
	 * 添加处理函数
	 * @public
	 */
	public readonly onChange: EventRegister<T> = this._onChange.register;
	private declare store: T;

	constructor(private readonly id: number, private readonly channel: IPCDriver) {
		this.onChange((value) => {
			this.store = value;
		});
	}

	getCurrentState(): DeepReadonly<T> {
		return this.store as DeepReadonly<T>;
	}

	stop() {}

	async dispose() {
		this._onChange.dispose();
		await this.channel.call({
			action: 'unsubscribe',
			subscribeId: this.id,
		});
	}
}
