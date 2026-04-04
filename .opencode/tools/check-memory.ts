/** biome-ignore-all lint/style/noDefaultExport: agent define */

import { tool } from '@opencode-ai/plugin';
import { executeTool } from '../common/exec.js';

export default tool({
	description: 'check if a file is outdated',
	args: {
		timestamp: tool.schema.int().describe('the file mtime or anything that can represent the file state'),
	},
	async execute(args, ctx) {
		return executeTool('check-memory', [args.timestamp.toString()], ctx.directory);
	},
});
