import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { dirname, join } from 'node:path';

export function isModuleNotFoundError(error: any): error is { code: 'ERR_MODULE_NOT_FOUND' } {
	return error?.code === 'ERR_MODULE_NOT_FOUND';
}

const matchReg = /Cannot find module '(.+)'/;

export function throwIt<T>(v: T | Error): T {
	if (v instanceof Error) {
		if (isModuleNotFoundError(v)) {
			if (matchReg.test(v.message)) {
				v.message = v.message.replace(matchReg, (m0, path) => {
					const pkg = findUpUntilSync('package.json', dirname(path));
					if (!pkg) {
						console.error(`Failed to find package.json for module '${path}'`);
						return m0;
					}

					const dir = dirname(pkg);
					path = path.replace(dir, '.');
					return `Cannot find module '${pkg}' (${path})`;
				});
			} else {
				console.error('Failed to parse ERR_MODULE_NOT_FOUND error message');
			}
		}
		throw v;
	}
	return v;
}

export function sizeOf(source: string | { readonly byteLength: number } | undefined) {
	if (!source) return 'undefined';

	if (typeof source === 'string') {
		return `${source.length} chars`;
	} else {
		return `${source.byteLength} bytes`;
	}
}

const isRoot = platform() === 'win32' ? /^[A-Z]:[/\\]$/i : /^\/$/;
function findUpUntilSync(file: string, from: string): string | null {
	const top = undefined;
	let cursor = join(from);

	while (true) {
		if (top && !cursor.startsWith(top)) {
			return null;
		}
		const found = findInDir(cursor);
		if (found) {
			return found;
		}
		if (isRoot.test(cursor)) {
			return null;
		}
		cursor = dirname(cursor);
	}

	function findInDir(dir: string): string | null {
		const target = join(dir, file);
		if (existsSync(target)) {
			return target;
		}
		return null;
	}
}
