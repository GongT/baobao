import { makeApplication } from '@idlebox/cli';

makeApplication({ name: 'websocket-compiler', description: 'type compiler for @gongt/websocket' }).simple(
	{
		args: {
			'--input -i': { description: '服务器/客户端实现文件', flag: false, usage: true },
			'--output -o': { description: '输出文件', flag: false, usage: true },
		},
		help: '',
		usage: '',
		positional: false,
	},
	async (args) => {
		const { websocketCompilerMain } = await import('./main.js');
		const { shutdown } = await import('@idlebox/node');

		await websocketCompilerMain(args);

		shutdown(0);
	},
);
