import type { IMessageObject } from '@mpis/shared';
import { AbstractChannelClient } from './abs.js';

/**
 * HTTP连接的客户端实现
 */
export class HttpClient extends AbstractChannelClient {
	constructor(private readonly remote: string) {
		super();
	}

	protected override async _disconnect() {}
	protected override async _connect() {}

	protected override async _send(message: IMessageObject): Promise<void> {
		const response = await fetch(this.remote, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});

		if (!response.ok) {
			throw new Error(`HTTP request failed with status ${response.status}: ${response.statusText}`);
		}

		const body: any = await response.json();
		if (!body.success) {
			throw new Error(body.message);
		}
	}
}
