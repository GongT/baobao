import { isWindows } from '@idlebox/common';
import { dirname, resolve } from 'node:path';
import { deprecate } from 'node:util';
import { exists, existsSync } from '../fs/exists.js';

export interface IFindOptions {
	/** 从哪开始找，必须是绝对路径 */
	from: string;
	/** 要找的文件 */
	file: string | string[];
	/** 最外层目录，超出或偏离都会停止搜索 */
	top?: string;
}

const isRoot = isWindows ? /^[A-Z]:[/\\]$/i : /^\/$/;

export async function findUpUntil(opts: IFindOptions): Promise<string | null>;
/** @deprecated */
export async function findUpUntil(from: string, file: string): Promise<string | null>;

export async function findUpUntil(opts: string | IFindOptions, file?: string): Promise<string | null> {
	if (typeof opts === 'string') {
		deprecate(findUpUntil, 'findUpUntil is deprecated. Use findUpUntil(opts) instead.');
		opts = { from: opts, file: [file!] };
	}
	if (typeof opts.file === 'string') {
		opts.file = [opts.file];
	}
	if (opts.top) {
		opts.top = resolve(opts.top);
	}

	const { from, file: files, top } = opts;

	for (let _from = resolve(from); !isRoot.test(_from); _from = dirname(_from)) {
		if (top && !_from.startsWith(top)) {
			return null;
		}
		for (const file of files) {
			const want = resolve(_from, file);
			if (await exists(want)) {
				return want;
			}
		}
	}

	for (const file of files) {
		const final = resolve(from, '/', file);
		if (await exists(final)) {
			return final;
		}
	}

	return null;
}

export function findUpUntilSync(opts: IFindOptions): string | null;
/** @deprecated */
export function findUpUntilSync(from: string, file: string): string | null;

export function findUpUntilSync(opts: string | IFindOptions, file?: string): string | null {
	if (typeof opts === 'string') {
		deprecate(findUpUntil, 'findUpUntil is deprecated. Use findUpUntil(opts) instead.');
		opts = { from: opts, file: [file!] };
	}
	if (typeof opts.file === 'string') {
		opts.file = [opts.file];
	}
	if (opts.top) {
		opts.top = resolve(opts.top);
	}

	const { from, file: files, top } = opts;

	for (let _from = resolve(from); !isRoot.test(_from); _from = dirname(_from)) {
		if (top && !_from.startsWith(top)) {
			return null;
		}
		for (const file of files) {
			const want = resolve(_from, file);
			if (existsSync(want)) {
				return want;
			}
		}
	}

	for (const file of files) {
		const final = resolve(from, '/', file);
		if (existsSync(final)) {
			return final;
		}
	}

	return null;
}
