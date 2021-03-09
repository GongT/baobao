import { Emitter, EventRegister } from '@idlebox/common';
import { IMessage, IPCDriver, isDataMessage } from './protocol';

export class StateSlave {
	private subList = new Map<number, EventHelper<any>>();

	constructor(private readonly channel: IPCDriver) {
		channel.handle((message) => this.handle(message));
	}

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

	async subscribe<T>(data: Record<keyof T, string[]>): Promise<Pick<EventHelper<T>, 'onChange' | 'dispose'>> {
		const subId = await this.channel.call({
			action: 'subscribe',
			subscribe: data,
		});
		// console.log('[Slave] subId=%s', subId);
		const eh = new EventHelper<T>(subId, this.channel);
		this.subList.set(subId, eh);
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
	public readonly _onChange = new Emitter<T>();
	public readonly onChange: EventRegister<T> = this._onChange.register;

	constructor(private readonly id: number, private readonly channel: IPCDriver) {}

	stop() {}
	async dispose() {
		this._onChange.dispose();
		await this.channel.call({
			action: 'unsubscribe',
			subscribeId: this.id,
		});
	}
}
