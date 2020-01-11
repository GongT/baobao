import { relative } from 'path';

export function relativePosix(from: string, to: string): string {
	return relative(from, to).replace(/\\/g, '/');
}