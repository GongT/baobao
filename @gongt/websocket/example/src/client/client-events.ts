import type { WebsocketSender } from '@gongt/websocket';

/**
 * some comment
 */
export interface ExampleClient extends WebsocketSender {
	receive_a_event_from_server(text: string): Promise<void>;
	receive_b_event_from_server(text: string): Promise<void>;
	receive_c_event_from_server(text: string): void;
}
