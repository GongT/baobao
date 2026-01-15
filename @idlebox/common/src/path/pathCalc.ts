import { normalizePath } from './normalizePath.js';

/**
 * 检查两个路径是否存在父子关系
 *
 * @param parent 父目录
 * @param child 子目录
 * @param equalsOk 默认为false，相等不属于父子。设为true则相等返回true
 * @returns 如果parent是child的父目录，则返回true
 */
export function isPathContains(parent: string, child: string, equalsOk = false): boolean {
	const nParent = normalizePath(parent);
	const nChild = normalizePath(child);

	if (nParent === nChild) return equalsOk;

	return nChild.startsWith(`${nParent}/`);
}
