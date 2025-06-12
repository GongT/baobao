import { checkChildProcessResult } from '@idlebox/node';
import { execa } from 'execa';
import { isQuiet } from '../functions/cli.js';
import { CSI, logger, writeHostLine } from '../functions/log.js';
import type { IPackageInfo } from '../workspace/workspace.js';

export async function cnpmSync(list: ReadonlyArray<IPackageInfo>, collectOutput = isQuiet) {
	const names = list.map((e) => e.packageJson.name);
	writeHostLine(`🔃 cnpm同步${list.length}个包`);

	const p = await execa('cnpm', ['sync', ...names], {
		stdio: collectOutput ? 'pipe' : 'inherit',
		buffer: collectOutput,
		all: collectOutput,
		fail: false,
		verbose: 'short',
		env: {
			http_proxy: undefined,
			https_proxy: undefined,
			all_proxy: undefined,
			HTTP_PROXY: undefined,
			HTTPS_PROXY: undefined,
			ALL_PROXY: undefined,
		},
	});

	try {
		checkChildProcessResult(p);
		if (collectOutput) {
			process.stderr.write(`${CSI}K`);
		}
		writeHostLine('    ✨ cnpm同步请求成功');
	} catch (e) {
		if (collectOutput) {
			logger.line();
			logger.error(p.all as any);
		}
		writeHostLine('    ⚠️ cnpm同步请求失败');
	}
}
