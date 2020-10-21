import { platform, tmpdir } from 'os';
import { resolve } from 'path';
import { findNpmCachePath } from './native.npm';

const privateCacheFolderName = 'poorcache';

export function cachedir() {
	const npmCachePath = findNpmCachePath();

	if (npmCachePath) {
		return resolve(npmCachePath, privateCacheFolderName);
	}

	if (process.env.SYSTEM_COMMON_CACHE) {
		return resolve(process.env.SYSTEM_COMMON_CACHE, privateCacheFolderName);
	} else if (platform() === 'linux') {
		return resolve('/var/cache', privateCacheFolderName);
	} else {
		return resolve(tmpdir(), privateCacheFolderName);
	}
}
