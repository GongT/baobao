import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { debug } from './debug';

export async function linkWithLog(from: string, symlink: string) {
	const updated = await ensureLinkTarget(from, symlink);
	if (updated) {
		debug('symlink(%s, %s)', from, symlink);
	}
}
