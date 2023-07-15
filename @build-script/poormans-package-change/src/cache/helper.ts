import { existsSync } from 'fs';
import { SyncOptions } from 'execa';

export function ifExists(s: string): string {
	if (typeof s !== 'string') return '';
	if (existsSync(s)) {
		return s;
	} else {
		return '';
	}
}

export const spawnOpts: SyncOptions = {
	encoding: 'utf8',
	reject: true,
	stdio: ['ignore', 'pipe', 'pipe'],
	stripFinalNewline: true,
	env: { LANG: 'C.UTF-8' },
	extendEnv: true,
};
