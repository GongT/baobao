import type { IPackageInfo } from '@build-script/monorepo-lib';
import { logger } from '@idlebox/logger';
import { checkChildProcessResult, printLine } from '@idlebox/node';
import { execa } from 'execa';
import { CSI, isQuiet } from '../functions/cli.js';

export async function cnpmSync(list: ReadonlyArray<IPackageInfo>, collectOutput = isQuiet, dryRun = false) {
	const names = list
		.filter((e) => {
			return !!e.packageJson.name && !e.packageJson.private;
		})
		.map((e) => e.packageJson.name);
	console.log(`🔃 cnpm同步${list.length}个包`);

	if (dryRun) {
		console.log('');
		console.log('');
		console.log('cnpm sync', ...names.map((value) => JSON.stringify(value)));
		console.log('');

		return;
	}
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
		console.log('    ✨ cnpm同步请求成功');
	} catch (e) {
		if (collectOutput) {
			printLine();
			logger.error(p.all as any);
		}
		console.log('    ⚠️ cnpm同步请求失败');
	}
}
