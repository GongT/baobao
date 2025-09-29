import { WebsocketServer } from '@gongt/websocket';

export abstract class ServerBase extends WebsocketServer {
	receive_c_event_from_client(text: string): void;
	receive_c_event_from_client(text: string, req?: boolean): void;
	receive_c_event_from_client(text: string) {
		console.log('Server received event C from client:', text);
		// this.remote;
	}
}

export interface ITestObject {
	readonly abc: 123;
}
