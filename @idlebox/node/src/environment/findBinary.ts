import { resolve } from 'path';
import { existsSync } from '../fs/exists';
import { PathEnvironment } from './pathEnvironment';

export function findBinary(
	what: string,
	pathvar: import('@idlebox/common').PathArray = new PathEnvironment(),
	cwd = process.cwd()
) {
	for (const path of pathvar.values()) {
		if (existsSync(path + '/' + what)) {
			return resolve(cwd, path, what);
		}
	}
	return '';
}
