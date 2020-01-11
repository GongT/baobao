import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

export function findUp(fromPath: string, findWhat: string) {
	let itr = fromPath;
	while (itr !== '/') {
		itr = dirname(itr);
		if (itr === '/' || /^[a-zA-Z]:\/?$/.test(itr)) {
			break;
		}

		const pkgFile = resolve(itr, findWhat);
		if (existsSync(pkgFile)) {
			return pkgFile;
		}
	}
	return undefined;
}
