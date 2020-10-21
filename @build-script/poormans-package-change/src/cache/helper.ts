import { SyncOptions } from 'execa';
import { pathExistsSync } from 'fs-extra';

export function ifExists(s: string): string {
	if (typeof s !== 'string') return '';
	if (pathExistsSync(s)) {
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
