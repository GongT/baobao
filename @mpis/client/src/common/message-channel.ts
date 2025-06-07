import { VoidClient, type AbstractChannelClient } from '../channel-client/abs.js';
import { HttpClient } from '../channel-client/http.js';
import { NodejsIpcClient } from '../channel-client/nodejs.js';

const server = process.env.BUILD_PROTOCOL_SERVER;

export let channelClient: AbstractChannelClient;
if (!server) {
	channelClient = new VoidClient();
	if (!process.stderr.isTTY) {
		channelClient.logger.error('BUILD_PROTOCOL_SERVER environment variable is not set, sending messages to void.');
	}
} else if (server === 'ipc:nodejs') {
	channelClient = new NodejsIpcClient();
} else if (server.startsWith('http://')) {
	channelClient = new HttpClient(server);
} else {
	throw new TypeError(`Unknown BUILD_PROTOCOL_SERVER: ${server}`);
}
