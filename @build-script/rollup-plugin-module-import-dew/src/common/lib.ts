import * as jspmResolve from '@jspm/resolve';
import { basename } from 'path';

const jspmCache: any = {};

/** @internal */
export function jspmResolveModuleAsync(name: string, from: string) {
	return jspmResolve(name, from, {
		env: { browser: true, node: false },
		cjsResolve: true,
		cache: jspmCache,
	});
}

interface ICache {
	[id: string]: boolean;
}

function toCase(str: string) {
	if (!str) {
		// console.log('  toCase: (empty)');
		return '';
	}
	return str
		.split(/[^a-z0-9$]/)
		.filter((s) => s.trim())
		.map((s) => {
			return s[0].toUpperCase() + s.slice(1);
		})
		.join('');
	// console.log('  toCase: %s = %s', str, ret);
}

/** @internal */
export function makeName(name: string, _path: string, exists: ICache) {
	let pkg = '';
	if (name.startsWith('@')) {
		const [a, b] = name.split('/', 2);
		pkg = toCase(a.slice(1)) + toCase(b);
	} else if (name.includes('/')) {
		pkg = toCase(name.split('/', 1)[0]);
	}
	const base = basename(name, '.js');

	const id = pkg + toCase(base);
	// console.log(name, '-->', id);
	if (!exists[id]) {
		exists[id] = true;
		return id;
	}

	let postfix = 1;
	while (exists[id + postfix]) {
		postfix++;
	}

	exists[id + postfix] = true;
	return id + postfix;
}
