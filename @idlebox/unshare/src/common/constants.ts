import { fileURLToPath } from 'node:url';
import type { ICommandToRun } from '../features/types.js';

export const CONTAINER_ENV_VAR_NAME = 'UNSHARE_CONTAINER_DATA';

export function getRespawnCommand(extraEnv: Record<string, string>): ICommandToRun {
	const leaderFile = fileURLToPath(import.meta.resolve('#leader'));

	return {
		commands: [process.execPath, leaderFile, process.execPath, ...process.argv.slice(1)],
		cwd: process.cwd(),
		extraEnv,
	};
}
