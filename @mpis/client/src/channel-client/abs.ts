import { AsyncDisposable, Emitter } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { BuildEvent, type IMessageObject } from '../types.js';

export type IUserMessageObject = Omit<IMessageObject, '__brand__' | 'title' | 'pid'>;

export const messageBrand = 'BPCM' as any;

enum ConnectionState {
	Disconnected,
	Connecting,
	Connected,
}

function getDefaultTitle(): string {
	if (process.env.BUILD_PROTOCOL_TITLE) {
		return process.env.BUILD_PROTOCOL_TITLE;
	}
	if (process.title !== 'node') {
		return process.title;
	}
	return process.argv[1];
}

export abstract class AbstractChannelClient extends AsyncDisposable {
	private cstate = ConnectionState.Disconnected;
	protected connecting?: Promise<any>;
	private queuedMessage?: IUserMessageObject;

	protected readonly _onFailure = new Emitter<Error>();
	public readonly onFailure = this._onFailure.register;

	constructor() {
		super();
		this._onFailure.register(() => {
			this.cstate = ConnectionState.Disconnected;
			this.connecting = undefined;
		});
		this.friendlyTitle = getDefaultTitle();
	}

	private declare _title: string;
	protected declare logger: IMyLogger;
	get friendlyTitle() {
		return this._title;
	}
	set friendlyTitle(title: string) {
		if (this._title === title) return;
		this._title = title;
		this.logger = createLogger(`mpis:${title}`);
	}

	success(message?: string, output?: string) {
		return this.send({
			event: BuildEvent.Success,
			output,
			message,
		});
	}
	failed(output: string) {
		return this.send({
			event: BuildEvent.Failed,
			output,
		});
	}
	start() {
		return this.send({
			event: BuildEvent.Start,
		});
	}

	private async send(message: IUserMessageObject) {
		try {
			if (this.cstate === ConnectionState.Connected) {
				this.logger.debug`emit: ${message.event}()`;
				await this._send({
					...message,
					__brand__: messageBrand,
					title: this.friendlyTitle,
					pid: process.pid,
				});
			} else {
				if (this.cstate === ConnectionState.Disconnected) {
					await this.connect();
				}
				this.logger.debug`will emit: ${message.event}()`;
				this.queuedMessage = message;
			}
		} catch (e: any) {
			this.logger.warn`send message failed: ${e?.message ?? e}`;
			this._onFailure.fireNoError(e);
		}
	}

	/** @internal */
	public async connect(): Promise<void> {
		this.logger.verbose`connect() current state=${ConnectionState[this.cstate]}`;
		if (this.cstate === ConnectionState.Connecting) {
			await this.connecting;
			return;
		} else if (this.cstate === ConnectionState.Connected) {
			return;
		}
		this.cstate = ConnectionState.Connecting;
		try {
			await this._connect();
			this.logger.debug`success connect server!`;
			this.cstate = ConnectionState.Connected;
			if (this.queuedMessage) {
				const v = this.queuedMessage;
				this.queuedMessage = undefined;
				await this.send(v);
			}
		} catch (err: any) {
			this.logger.error`failed to connect server: ${err?.message ?? err}`;
			this._onFailure.fire(err as Error);
		}
	}

	private reset() {
		this.connecting = undefined;
		this.queuedMessage = undefined;
		this.cstate = ConnectionState.Disconnected;
	}

	protected async disconnect() {
		this.logger.verbose('disconnect()');
		if (this.cstate !== ConnectionState.Connected) {
			return;
		}
		await this._disconnect();
		this.reset();
	}

	protected abstract _disconnect(): Promise<void>;
	protected abstract _connect(): Promise<void>;
	protected abstract _send(message: IMessageObject): void | Promise<void>;
}

export class VoidClient extends AbstractChannelClient {
	protected override async _disconnect(): Promise<void> {}
	protected override async _connect(): Promise<void> {}
	protected override _send(message: IMessageObject): void {
		this.logger.warn(`VoidClient: ${message.event} ${message.title} ${message.output}`);
	}
}
