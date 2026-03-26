import { VoidClient, type IChannelClient } from '../channel-client/abs.js';
import { HttpClient } from '../channel-client/http.js';
import { NodejsIpcClient } from '../channel-client/nodejs.js';

function creation() {
	let channelClient;
	const server = process.env.BUILD_PROTOCOL_SERVER;
	if (!server) {
		channelClient = new VoidClient();
		if (!process.stderr.isTTY) {
			channelClient.logger.warn`BUILD_PROTOCOL_SERVER environment variable is not set, sending messages to void.`;
		}
	} else if (server === 'ipc:nodejs') {
		channelClient = new NodejsIpcClient();
	} else if (server.startsWith('http://')) {
		channelClient = new HttpClient(server);
	} else {
		throw new TypeError(`Unknown BUILD_PROTOCOL_SERVER: ${server}`);
	}
	return channelClient;
}

// 创建一个代理对象，在第一次调用接口方法时创建真正的client实例，并替换代理方法
export let channelClient: IChannelClient = {} as any;

let interfaceKeys = ['success', 'failed', 'start'] as const;
for (const key of interfaceKeys) {
	Object.defineProperty(channelClient, key, {
		get() {
			const newObject = creation();

			for (const key of interfaceKeys) {
				newObject[key] = newObject[key].bind(newObject) as any;

				// 防止有人保存 channelClient 的引用
				delete channelClient[key];
				Object.defineProperty(channelClient, key, {
					value: newObject[key],
					enumerable: true,
					configurable: false,
					writable: false,
				});
			}

			interfaceKeys = undefined as any;

			channelClient = newObject;

			return newObject[key];
		},
		configurable: true,
		enumerable: true,
	});
}
