import { VoidClient, type AbstractChannelClient } from '../channel-client/abs.js';
import { HttpClient } from '../channel-client/http.js';
import { NodejsIpcClient } from '../channel-client/nodejs.js';

const server = process.env.BUILD_PROTOCOL_SERVER;
if (!server) {
	throw new TypeError('BUILD_PROTOCOL_SERVER environment variable is not set');
}
process.env.BUILD_PROTOCOL_SERVER = '';

export let channelClient: AbstractChannelClient;
if (server === 'ipc:nodejs') {
	channelClient = new NodejsIpcClient();
} else if (server.startsWith('http://')) {
	channelClient = new HttpClient(server);
} else if (server) {
	throw new TypeError(`Unknown BUILD_PROTOCOL_SERVER: ${process.env.BUILD_PROTOCOL_SERVER}`);
} else {
	if (!process.stderr.isTTY) {
		console.warn('not called from a build manager, BUILD_PROTOCOL_SERVER is not set.');
	}
	channelClient = new VoidClient();
}

// await channelClient.connect();
