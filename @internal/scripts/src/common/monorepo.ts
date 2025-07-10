import { logger } from '@idlebox/logger';
import { execLazyError } from '@idlebox/node';
import { monorepoRoot } from './constants.js';

export interface IPackageInfo {
	name: string;
	version: string;
	path: string;
	private: boolean;
}

async function execJson(cmds: string[], cwd: string) {
	const p = await execLazyError(cmds[0], cmds.slice(1), { cwd });
	return JSON.parse(p.stdout);
}

export async function listPnpm(projectRoot: string = monorepoRoot): Promise<IPackageInfo[]> {
	logger.debug('使用pnpm命令列出项目');
	return await execJson(['pnpm', 'recursive', 'ls', '--depth=-1', '--json'], projectRoot);
}
