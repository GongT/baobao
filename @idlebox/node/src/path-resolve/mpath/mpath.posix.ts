import assert from 'node:assert/strict';
import type { IPathInfo } from './types.js';

const continueSlash = /\/{2,}/g;
export function normalizeSlash(path: string): string {
	return path.replaceAll(continueSlash, '/');
}

export function _isRoot(path: string): boolean {
	return path === '/';
}

export function _isAbsolute(path: string): boolean {
	return path.startsWith('/');
}

export function _rootOf(_path: string): string {
	return '/';
}

export function _dirname(path: string): string {
	if (path === '/') {
		return path;
	}

	if (path.endsWith('/')) {
		path = path.slice(0, -1);
	}

	const last = path.lastIndexOf('/');
	if (last === 0) {
		return '/';
	}

	assert.notEqual(last, -1, `异常路径状态: ${path}`);
	return path.slice(0, last); // with trailing slash removed
}

export function _split(path: string): IPathInfo {
	return {
		root: '/',
		path: path.slice(1),
	};
}

export function _assertAbsolute(path: string): void {
	assert.ok(path.startsWith('/'), `路径不是绝对路径: ${path}`);
}
