import type { ExampleClient } from './event-def.js';
import { ServerBase } from './indrect.js';

class SomeInternalClass {
	public readonly secret = 123;
}

/**
 * server comment
 */
export class ExampleServer extends ServerBase {
	protected declare pushEvents: ExampleClient;
	protected override getContext(): Promise<any> | any {
		return { a: 1 };
	}

	private readonly a = 1;

	async receive_a_event_from_client(id: string, text?: string) {
		this.pushEvents;
		console.log('Server received event A from client:', id, text);
	}
	async receive_b_event_from_client(text?: string) {
		console.log('Server received event B from client:', text);
		return 'Response from server for event B';
	}

	protected getSecret() {
		return new SomeInternalClass();
	}

	protected abc(s: string) {
		return `s:${s}, a:${this.a}`;
	}
}

class Y {}
export class X extends Y {}
