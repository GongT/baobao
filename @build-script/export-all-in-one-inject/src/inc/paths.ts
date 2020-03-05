import { relative } from 'path';

export function relativePosix(from: string, to: string): string {
	return relative(from, to).replace(/\\/g, '/');
}

export const INDEX_FILE_NAME = '_export_all_in_one_index';
