import { isWindows } from '@idlebox/common';
import { tmpdir } from 'node:os';
import { normalize, relative, resolve } from 'node:path';

const winSlash = /\\/g;

export type ResolvePathFunction = (...pathSegments: string[]) => string;

export type JoinPathFunction = (from: string, to: string) => string;

export const resolvePath: ResolvePathFunction = isWindows ? resolveWindowsPath : resolve;

function resolveWindowsPath(...pathSegments: string[]): string {
	return resolve(...pathSegments).replace(winSlash, '/');
}

export type NormalizePathFunction = (path: string) => string;

export const normalizePath: NormalizePathFunction = isWindows ? normalizeWindowsPath : normalize;

function normalizeWindowsPath(path: string): string {
	return normalize(path).replace(winSlash, '/');
}

export function osTempDir(name?: string) {
	if (name) {
		return resolvePath(tmpdir(), name);
	}
	return resolvePath(tmpdir());
}

function relativeWindowsPath(from: string, to: string) {
	return relative(normalize(from), normalize(to)).replace(winSlash, '/');
}

export const relativePath: JoinPathFunction = isWindows ? relativeWindowsPath : relative;
