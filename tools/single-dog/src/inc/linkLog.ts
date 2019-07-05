import { ensureLinkTarget } from '../../../../base/ensure-symlink';

export async function linkWithLog(from: string, symlink: string) {
	const updated = await ensureLinkTarget(from, symlink);
	if (updated) {
		console.log('symlink(%s, %s)', from, symlink);
	}
}
