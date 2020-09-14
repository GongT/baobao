import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { lstatSync, pathExistsSync } from 'fs-extra';
import { debug } from './debug';

export async function linkWithLog(from: string, symlink: string) {
	if (pathExistsSync(symlink) && !lstatSync(symlink).isSymbolicLink()) {
		return;
	}
	const updated = await ensureLinkTarget(from, symlink);
	if (updated) {
		debug('symlink(%s, %s)', from, symlink);
	}
}
