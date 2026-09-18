import { isWindows } from '@idlebox/common';
import { access, accessSync, constants } from 'node:fs';
import { PathEnvironment } from '../environment/pathEnvironment.js';

/**
 * 注意确保 isWindows == true
 * @internal
 */
export const windowsExecExtensions: readonly string[] = isWindows
	? (process.env.PATHEXT?.toUpperCase().split(';') ?? ['.EXE', '.CMD', '.BAT', '.COM'])
	: (undefined as any);

function exts(alterExt?: string[]) {
	if (alterExt) {
		const ret = [...alterExt];
		if (!isWindows) {
			ret.unshift('');
		}
		return ret;
	}
	if (isWindows) {
		return windowsExecExtensions;
	}
	return [''];
}

/**
 * 通过文件系统操作遍历 PATH 环境变量，查找可执行命令
 * @param cmd 要查找的命令名称
 * @param alterExt 可选的文件扩展名列表，在windows上默认为PATHEXT指定（例如 .EXE, .CMD 其中通常没有 .ps1）
 * @returns 找到的可执行命令的完整路径，如果未找到则返回 undefined
 * @throws 不会reject
 */
export async function commandInPath(cmd: string, alterExt?: string[]): Promise<string | undefined> {
	const pathVar = new PathEnvironment();
	for (const item of pathVar.joinpath(cmd)) {
		for (const ext of exts(alterExt)) {
			const found = await new Promise((resolve) => {
				access(item + ext, constants.X_OK, (e) => {
					if (e) resolve(false);
					else resolve(true);
				});
			});
			if (found) return item + ext;
		}
	}
	return undefined;
}

/**
 * 同步版本的 commandInPath
 */
export function commandInPathSync(cmd: string, alterExt?: string[]): string | undefined {
	const pathVar = new PathEnvironment();
	for (const item of pathVar.joinpath(cmd)) {
		for (const ext of exts(alterExt)) {
			try {
				accessSync(item + ext, constants.X_OK);
				return item + ext;
			} catch {}
		}
	}
	return undefined;
}
