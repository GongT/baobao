import { spawnSync, SpawnSyncOptions } from 'child_process';
import { debug } from './debug';

export function spawnSyncLog(command: string, args: ReadonlyArray<string> = [], options?: SpawnSyncOptions) {
	debug(' + \x1B[38;5;14m%s %s\x1B[0m', command, args.join(' '));
	spawnSync(command, args, options);
}
