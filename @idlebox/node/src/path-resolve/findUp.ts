import { isWindows } from '@idlebox/common';
import { dirname, join, resolve } from 'node:path';
import { exists, existsSync } from '../fs/exists.js';

export interface IFindOptions {
	/** 从哪开始找，必须是绝对路径 */
	from: string;
	/** 要找的文件 */
	file: string | string[];
	/** 最外层目录，超出或偏离都会停止搜索 */
	top?: string;
	/** 如果为false，则不使用resolve() */
	resolveSymlink?: boolean;
}

const isRoot = isWindows ? /^[A-Z]:[/\\]$/i : /^\/$/;

export async function findUpUntil(opts: IFindOptions): Promise<string | null> {
	const resolvePath = opts.resolveSymlink === false ? join : resolve;
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	const top = opts.top ? resolvePath(opts.top) : undefined;
	let cursor = resolvePath(opts.from);

	while (true) {
		if (top && !cursor.startsWith(top)) {
			return null;
		}
		const found = await findInDir(cursor);
		if (found) {
			return found;
		}
		if (isRoot.test(cursor)) {
			return null;
		}
		cursor = dirname(cursor);
	}

	async function findInDir(dir: string): Promise<string | null> {
		for (const file of files) {
			const target = resolvePath(dir, file);
			if (await exists(target)) {
				return target;
			}
		}
		return null;
	}
}

export async function* findUp(opts: IFindOptions): AsyncIterableIterator<string> {
	const resolvePath = opts.resolveSymlink === false ? join : resolve;
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	const top = opts.top ? resolvePath(opts.top) : undefined;
	let cursor = resolvePath(opts.from);

	while (true) {
		if (top && !cursor.startsWith(top)) {
			break;
		}
		const found = await findInDir(cursor);
		for (const file of found) {
			yield file;
		}

		if (isRoot.test(cursor)) {
			break;
		}
		cursor = dirname(cursor);
	}

	async function findInDir(dir: string) {
		const items = await Promise.all(
			files.map(async (file) => {
				const target = resolvePath(dir, file);

				if (await exists(target)) {
					return target;
				} else {
					return undefined;
				}
			}),
		);
		return items.filter((item): item is string => !!item);
	}
}

export function findUpUntilSync(opts: IFindOptions): string | null {
	const resolvePath = opts.resolveSymlink === false ? join : resolve;
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	const top = opts.top ? resolvePath(opts.top) : undefined;
	let cursor = resolvePath(opts.from);

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
		for (const file of files) {
			const target = resolvePath(dir, file);
			if (existsSync(target)) {
				return target;
			}
		}
		return null;
	}
}

export function findUpSync(opts: IFindOptions): string[] {
	const resolvePath = opts.resolveSymlink === false ? join : resolve;
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	const top = opts.top ? resolvePath(opts.top) : undefined;
	let cursor = resolvePath(opts.from);
	const results: string[] = [];

	while (true) {
		if (top && !cursor.startsWith(top)) {
			break;
		}
		findInDir(cursor);
		if (isRoot.test(cursor)) {
			break;
		}
		cursor = dirname(cursor);
	}

	return results;

	function findInDir(dir: string) {
		for (const file of files) {
			const target = resolvePath(dir, file);
			if (existsSync(target)) {
				results.push(target);
			}
		}
	}
}
