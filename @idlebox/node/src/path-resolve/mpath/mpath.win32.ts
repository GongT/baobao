import assert from 'node:assert/strict';
import type { IPathInfo } from './types.js';

const continueSlash = /[\\/]+/g;
const startingDoubleSlash = /^[\\/]{2,}/;
export function normalizeSlash(path: string): string {
	if (startingDoubleSlash.test(path)) {
		path = path.replace(startingDoubleSlash, '//');
		path = path.slice(2).replaceAll(continueSlash, '/');
		return `//${path}`;
	} else {
		return path.replaceAll(continueSlash, '/');
	}
}

// 普通卷名 (例如 C:\)
const _winDriveRootRegex = /[A-Z]:\//i;
// UNC 根路径 (例如 \\server\share\)
const _winUncRootRegex = /\/{2}[^.?][^/]*\/[^/:]+\/?/i;
// 统一卷名 (例如 \\?\C:\ 和 \\?\Volume{...}\)
const _winUniDriveRootRegex = /\/{2}[.?]\/(?:[A-Z]:|Volume{[^}]+})\//i;
// 统一UNC 根路径 (例如 \\?\UNC\server\share\)
const _winUniUncRootRegex = /\/{2}[.?]\/UNC\/[^/]+\/[^/:]+\/?/i;

/** @__NO_SIDE_EFFECTS__ */
function merge() {
	return [_winUniDriveRootRegex.source, _winUniUncRootRegex.source, _winDriveRootRegex.source, _winUncRootRegex.source].join('|');
}

const winRootRegex = /* @__PURE__ */ new RegExp(`^(?:${merge()})$`, 'i');
const winAbsoluteRegex = /* @__PURE__ */ new RegExp(`^(?:${merge()})`, 'i');

function splitLow(path: string): IPathInfo | undefined {
	const match = path.match(winAbsoluteRegex);
	if (!match) return undefined;
	let root = match[0];
	if (!root.endsWith('/')) {
		root += '/';
	}
	return {
		root,
		path: path.slice(root.length),
	};
}

export function _split(path: string): IPathInfo {
	const r = splitLow(path);
	assert.ok(r, `异常路径，此调用应已经保证路径是可分割的，但实际不行: ${path}`);
	return r;
}

export function _isRoot(path: string) {
	return winRootRegex.test(path);
}

/**
 * 一般认为 windows 下的 /x/y/z 是绝对路径
 * 但这种路径实际上有歧义，它会根据当前驱动器的上下文来解析。
 * 所以特别排除这种情况，其他情况与标准库尽可能一致。
 * 另外，也不支持类似NUL、CON、PRN这样的设备名。
 */
export function _isAbsolute(path: string): boolean {
	if (path[0] === '/' && path[1] !== '/') return false;
	return winAbsoluteRegex.test(path);
}

export function _rootOf(path: string): string {
	const m = path.match(winAbsoluteRegex);
	if (!m) {
		throw new Error(`异常根路径: ${path}`);
	}
	return m[0];
}

export function _dirname(path: string): string {
	const sp = _split(path);
	let dir = sp.path;
	if (dir.endsWith('/')) {
		dir = dir.slice(0, -1);
	}
	const idx = dir.lastIndexOf('/');
	if (idx === -1) {
		dir = '';
	} else {
		dir = dir.slice(0, idx);
	}
	return dir ? `${sp.root}${dir}` : sp.root;
}

export function _assertAbsolute(path: string): void {
	assert.ok(_isAbsolute(path), `路径不是绝对路径: ${path}`);
}
