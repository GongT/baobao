import { AsyncDisposable, Emitter, lcfirst } from "@idlebox/common";
import { BuildEvent, type IMessageObject } from "../types.js";

export type IUserMessageObject = Omit<
	IMessageObject,
	"__brand__" | "title" | "pid"
>;

export const messageBrand = "BPCM" as any;

enum ConnectionState {
	Disconnected,
	Connecting,
	Connected,
}

export abstract class AbstractChannelClient extends AsyncDisposable {
	private cstate = ConnectionState.Disconnected;
	protected connecting?: Promise<any>;
	private queuedMessage?: IUserMessageObject;

	protected readonly _onFailure = new Emitter<Error>();
	public readonly onFailure = this._onFailure.register;

	constructor(public readonly friendlyTitle: string) {
		super();
		this._onFailure.register(() => {
			this.cstate = ConnectionState.Disconnected;
			this.connecting = undefined;
		});
	}

	success(message?: string, output?: string) {
		this.send({
			event: BuildEvent.Success,
			output,
			message,
		});
	}
	failed(output: string) {
		this.send({
			event: BuildEvent.Failed,
			output,
		});
	}
	start() {
		this.send({
			event: BuildEvent.Start,
		});
	}

	private send(message: IUserMessageObject) {
		if (this.cstate === ConnectionState.Connected) {
			return this._send({
				...message,
				__brand__: messageBrand,
				title: this.name,
				pid: process.pid,
			});
		} else {
			this.queuedMessage = message;
		}
	}

	get name() {
		return lcfirst(this.constructor.name).replace("Client", "");
	}

	/** @internal */
	public async connect(): Promise<void> {
		if (this.cstate === ConnectionState.Connecting) {
			await this.connecting;
			return;
		} else if (this.cstate === ConnectionState.Connected) {
			return;
		}
		this.cstate = ConnectionState.Connecting;
		try {
			await this._connect();
			this.cstate = ConnectionState.Connected;
			if (this.queuedMessage) {
				const v = this.queuedMessage;
				this.queuedMessage = undefined;
				this.send(v);
			}
		} catch (err: any) {
			console.error(
				`failed to connect server with ${this.name}: ${err?.message ?? err}`,
			);
			this._onFailure.fire(err as Error);
		}
	}

	private reset() {
		this.connecting = undefined;
		this.queuedMessage = undefined;
		this.cstate = ConnectionState.Disconnected;
	}

	protected async disconnect() {
		if (this.cstate !== ConnectionState.Connected) {
			return;
		}
		await this._disconnect();
		this.reset();
	}

	protected abstract _disconnect(): Promise<void>;
	protected abstract _connect(): Promise<void>;
	protected abstract _send(message: IMessageObject): void;
}

export class VoidClient extends AbstractChannelClient {}
