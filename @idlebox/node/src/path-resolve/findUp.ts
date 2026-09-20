import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { exists, existsSync } from '../fs/exists.js';
import { mpath } from './mpath/mpath.js';

export interface IFindOptions {
	/** 从哪开始找，必须是绝对路径 */
	from: string;
	/** 要找的文件 */
	file: string | string[];
	/** 最外层目录，超出或偏离都会停止搜索，必须是绝对路径 */
	top?: string;
}

export async function findUpUntil(opts: IFindOptions): Promise<string | null> {
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	assert.ok(files.length > 0, '参数"file"不能为空');
	assert.ok(mpath.isAbsolute(opts.from), '参数"from"必须是绝对路径');
	if (opts.top) assert.ok(mpath.isAbsolute(opts.top), '参数"top"必须是绝对路径');

	let cursor = mpath.normalizeSlash(opts.from);
	const top = opts.top ? mpath.normalizeSlash(opts.top) : mpath.rootOf(opts.from);

	while (true) {
		if (top && !cursor.startsWith(top)) {
			return null;
		}
		const found = await findInDir(cursor);
		if (found) {
			return found;
		}
		if (mpath.isRoot(cursor)) {
			return null;
		}
		cursor = mpath.dirname(cursor);
	}

	async function findInDir(dir: string): Promise<string | null> {
		for (const file of files) {
			const target = resolve(dir, file);
			if (await exists(target)) {
				return target;
			}
		}
		return null;
	}
}

export async function* findUp(opts: IFindOptions): AsyncIterableIterator<string> {
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	let cursor = mpath.normalizeSlash(opts.from);
	const top = opts.top ? mpath.normalizeSlash(opts.top) : undefined;

	while (true) {
		if (top && !cursor.startsWith(top)) {
			break;
		}
		const found = await findInDir(cursor);
		for (const file of found) {
			yield file;
		}

		if (mpath.isRoot(cursor)) {
			break;
		}
		cursor = mpath.dirname(cursor);
	}

	async function findInDir(dir: string) {
		const items = await Promise.all(
			files.map(async (file) => {
				const target = resolve(dir, file);

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
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	let cursor = mpath.normalizeSlash(opts.from);
	const top = opts.top ? mpath.normalizeSlash(opts.top) : undefined;

	while (true) {
		if (top && !cursor.startsWith(top)) {
			return null;
		}
		const found = findInDir(cursor);
		if (found) {
			return found;
		}
		if (mpath.isRoot(cursor)) {
			return null;
		}
		cursor = mpath.dirname(cursor);
	}

	function findInDir(dir: string): string | null {
		for (const file of files) {
			const target = resolve(dir, file);
			if (existsSync(target)) {
				return target;
			}
		}
		return null;
	}
}

export function findUpSync(opts: IFindOptions): string[] {
	const files = Array.isArray(opts.file) ? opts.file : [opts.file];
	let cursor = mpath.normalizeSlash(opts.from);
	const top = opts.top ? mpath.normalizeSlash(opts.top) : undefined;
	const results: string[] = [];

	while (true) {
		if (top && !cursor.startsWith(top)) {
			break;
		}
		findInDir(cursor);
		if (mpath.isRoot(cursor)) {
			break;
		}
		cursor = mpath.dirname(cursor);
	}

	return results;

	function findInDir(dir: string) {
		for (const file of files) {
			const target = resolve(dir, file);
			if (existsSync(target)) {
				results.push(target);
			}
		}
	}
}
