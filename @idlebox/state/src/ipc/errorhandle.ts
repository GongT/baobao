import { DeferredPromise } from '@idlebox/common';
import { IMessage } from './protocol';

export type IRawMessage = IRawMessageReply | IRawMessageSend;
export interface IRawMessageSend {
	__messageKind: string;
	reply: false;
	guid: number;
	message: IMessage;
}
export interface IRawMessageReply {
	__messageKind: string;
	reply: true;
	guid: number;
	content?: any;
	error?: {
		message: string;
		stack?: string;
	};
}

const messageKind = 'this message send by @idlebox/state';
let guid = 0;

class RawMessageHandler {
	private wait = new Map<number, DeferredPromise<any>>();

	send(message: IMessage): [IRawMessageSend, Promise<any>] {
		const msg: IRawMessageSend = {
			__messageKind: messageKind,
			reply: false,
			guid: ++guid,
			message,
		};

		const dfd = new DeferredPromise();
		this.wait.set(msg.guid, dfd);

		return [msg, dfd.p];
	}

	reply(original: IRawMessageSend, replyData: any): IRawMessageReply {
		const msg: IRawMessageReply = {
			__messageKind: messageKind,
			reply: true,
			guid: original.guid,
			content: undefined,
		};
		if (replyData instanceof Error) {
			msg.error = { stack: replyData.stack, message: replyData.message };
		} else {
			msg.content = replyData;
		}
		return msg;
	}

	recv(data: IRawMessage): IMessage | null {
		if (!data || data.__messageKind !== messageKind) {
			return null;
		}
		if (data.reply) {
			// console.log('                   - resolved! (last %s items)', this.wait.size);
			if (this.wait.size > 10) {
				console.warn('more than %s pending ipc message, something seems wrong.', this.wait.size);
				if (this.wait.size > 30) {
					process.exit(1);
				}
			}
			this.gotReply(data);
			return null;
		}
		return data.message;
	}

	private gotReply(data: IRawMessageReply) {
		if (this.wait.has(data.guid)) {
			const dfd = this.wait.get(data.guid)!;
			this.wait.delete(data.guid);

			if (data.error) {
				const err = new Error(data.error.message);
				err.stack = data.error.stack || data.error.message;
				// console.log(' ::: got reply error=%s', err.message);
				dfd.error(err);
			} else {
				// console.log(' ::: got reply content=%j', data.content);
				dfd.complete(data.content!);
			}
		} else {
			console.warn('invalid message, not wait: ');
		}
	}
}

export const rawMessageHandler = new RawMessageHandler();
