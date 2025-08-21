import { logger } from '@idlebox/logger';
import type { ProcessIPCClient } from '@mpis/server';
import { workersManager } from './manager.js';
import { registerCommand } from './stdin.js';

export function addBreakModeDebugCommands() {
	logger.warn`Break mode enabled, waiting for input command...`;

	registerCommand({
		name: ['continue', 'c'],
		description: '开始执行',
		callback: () => {
			workersManager.finalize().startup();
		},
	});
	registerCommand({
		name: ['debug'],
		description: '切换调试模式（仅在启动前有效）',
		callback: (text: string) => {
			const [_, index, on_off] = text.split(/\s+/);
			const list = workersManager._allWorkers as ProcessIPCClient[];
			const worker = list[Number(index)];
			if (!worker) {
				logger.error`worker index out of range: ${index}`;
				return;
			}
			if (on_off === 'on') {
				worker.env['DEBUG'] = '*,-executer:*,-dispose:*';
				worker.env['DEBUG_LEVEL'] = 'verbose';
				logger.success`debug mode enabled for worker "${worker._id}"`;
			} else if (on_off === 'off') {
				worker.env['DEBUG'] = '';
				worker.env['DEBUG_LEVEL'] = '';
				logger.success`debug mode disabled for worker "${worker._id}"`;
			} else {
				logger.error`invalid argument: ${text}`;
			}
		},
	});
	// registerCommand({
	// 	name: ['print', 'p'],
	// 	description: '显示命令执行输出',
	// 	callback: () => {
	// 	},
	// });
}
