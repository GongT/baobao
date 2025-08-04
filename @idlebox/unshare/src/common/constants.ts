import { resolve } from 'node:path';
import type { ICommandToRun } from './types.js';

export const CHILDREN_DIR = resolve(import.meta.dirname, '../children');
export const CONTAINER_ENV_VAR_NAME = 'UNSHARE_CONTAINER_DATA';

export function getRespawnCommand(extraEnv: Record<string, string>): ICommandToRun {
	const leaderFile = resolve(import.meta.dirname, '../children/leader.js');

	return {
		commands: [process.execPath, leaderFile, process.execPath, ...process.argv.slice(1)],
		cwd: process.cwd(),
		extraEnv,
	};
}

export const GLOBAL_SIGNAL = Symbol('unshared');
