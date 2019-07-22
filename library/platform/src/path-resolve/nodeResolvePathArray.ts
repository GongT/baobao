import { dirname, resolve } from 'path';

export function nodeResolvePathArray(from: string, file = 'node_modules') {
	const ret: string[] = [];
	do {
		ret.push(resolve(from, file));
		from = dirname(from);
	} while (from !== '/');
	return ret;
}
