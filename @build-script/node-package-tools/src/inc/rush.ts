import { dirname, resolve } from 'path';
import { findUpUntilSync } from '@idlebox/node';

let rootDir: string | null;
function findRoot(from: string) {
	if (typeof rootDir === 'undefined') {
		const found = findUpUntilSync(from, 'rush.json');
		if (found) {
			rootDir = dirname(found);
		} else {
			rootDir = null;
		}
	}
	return rootDir;
}

export function getTempFolder(from: string) {
	const rushRoot = findRoot(from);
	if (rushRoot) {
		return resolve(rushRoot, 'common/temp/pack');
	} else {
		return resolve(from, 'temp');
	}
}
