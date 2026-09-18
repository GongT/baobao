import { isWindows } from '@idlebox/common';
import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { windowsExecExtensions } from './commandExists.js';

/**
 * 判断文件是否可执行
 *
 * - 在 Windows 上通过文件扩展名
 * - 在 Unix 上通过文件权限
 */
export async function isFileExecutable(file: string) {
	if (isWindows) {
		return isFileExecExt(file);
	} else {
		return isFileExecBit(file);
	}
}

/**
 * 检查文件的可执行位
 */
export async function isFileExecBit(file: string) {
	const ss = await stat(file);
	return !!(ss.mode & 0o100);
}

/**
 * 检查文件扩展名是否表示可执行文件
 *
 * 此函数仅在 Windows 上有效
 */
export function isFileExecExt(file: string) {
	const ext = extname(file);
	if (!ext) return false;
	return (windowsExecExtensions ?? []).includes(ext.toUpperCase());
}
