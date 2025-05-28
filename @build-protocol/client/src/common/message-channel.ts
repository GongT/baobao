import type { AbstractChannelClient } from '../channel-client/abs.js';
import { NetworkClient } from '../channel-client/network.js';
import { NodejsIpcClient } from '../channel-client/nodejs.js';

const server = process.env.BUILD_PROTOCOL_SERVER;
if (!server) {
	throw new TypeError('BUILD_PROTOCOL_SERVER environment variable is not set');
}

export let channelClient: AbstractChannelClient;
if (server === 'ipc:nodejs') {
	channelClient = new NodejsIpcClient();
} else if (server.startsWith('tcp:')) {
	const remote = server.slice(4);
	channelClient = new NetworkClient(remote);
} else if (server) {
	throw new TypeError(`Unknown BUILD_PROTOCOL_SERVER: ${process.env.BUILD_PROTOCOL_SERVER}`);
} else {
	if (process.stderr.isTTY) {
		console.warn('not called from manager, BUILD_PROTOCOL_SERVER is not set.');
	}
}
