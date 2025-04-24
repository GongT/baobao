import { isAbsolute } from 'node:path';

export function lrelative(from: string, to: string) {
	if (!isAbsolute(from)) {
		throw new Error(`lrelative: from is not absolute: ${from}`);
	}
	if (!isAbsolute(to)) {
		throw new Error(`lrelative: to is not absolute: ${to}`);
	}
	const fa = from.split(/[\/\\]/g).filter((e) => e);
	const ta = to.split(/[\/\\]/g).filter((e) => e);
	const f = ta.pop();
	while (fa[0] === ta[0]) {
		fa.shift();
		ta.shift();
	}
	const ret = fa.length === 0 ? ['.'] : new Array(fa.length).fill('..');
	ret.push(...ta, f);
	return ret.join('/');
}
