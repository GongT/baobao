import { Options, SyncOptions } from 'execa';
import { existsSync } from 'fs';

export function ifExists(s: string): string {
	if (typeof s !== 'string') return '';
	if (existsSync(s)) {
		return s;
	} else {
		return '';
	}
}

export const spawnOpts = {
	encoding: 'utf8',
	reject: true,
	stdio: ['pipe', 'pipe', 'pipe'],
	stripFinalNewline: true,
	env: { LANG: 'C.UTF-8', npm_config_perfer_offline: 'false', npm_config_perfer_online: 'true' },
	extendEnv: true,
} satisfies SyncOptions | Options;
