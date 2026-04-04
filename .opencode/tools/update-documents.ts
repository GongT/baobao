/** biome-ignore-all lint/style/noDefaultExport: agent define */

import { tool } from '@opencode-ai/plugin';
import { executeTool, repoRoot } from '../common/exec.js';

export default tool({
	description: 'List source files whose documentation is outdated (modified after last doc commit). Also deletes orphaned doc files in gh-docs/ for that package.',
	args: {},
	async execute() {
		const jobs = [];

		const r1 = await executeTool('list-outdated-source', ['@idlebox/common', '@idlebox/node-error-codes', '@idlebox/errors'], repoRoot);

		if (r1) {
			jobs.push([`# job for @idlebox/common`, r1, '']);
		}

		for (const packageName of ['@idlebox/browser', '@idlebox/node']) {
			const r2 = await executeTool('list-outdated-source', [packageName], repoRoot);
			if (r2) {
				jobs.push([`## job for ${packageName}`, r2, '']);
			}
		}

		if (jobs.length === 0) {
			return 'congratulations! no works to do.';
		}

		jobs.unshift('# You need dispatch these documentation jobs to agents:', '', 'Node: everyone must follow follows .agent/documentation.md', '');

		return jobs.join('\n');
	},
});
