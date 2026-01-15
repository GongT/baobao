import type { IMountInfo } from '../features/types.js';

export function inside(path: string, containers: readonly string[]) {
	for (const what of containers) {
		if (path === what || path.startsWith(`${what}/`)) {
			return true;
		}
	}
	return false;
}

export function outside(container: string, files: readonly string[]) {
	for (const file of files) {
		if (container === file || file.startsWith(`${container}/`)) {
			return true;
		}
	}
	return false;
}

export function findNearestMountpoint(filesystem: readonly IMountInfo[], path: string) {
	const found = filesystem.find((mnt) => inside(path, [mnt.target]));
	if (!found) {
		throw new Error(`无法找到路径 ${path} 所在的挂载点（缺少root?）`);
	}
	return found;
}
