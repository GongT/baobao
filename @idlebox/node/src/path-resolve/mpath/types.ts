export class RelativePathError extends Error {
	constructor(path?: string) {
		super(`路径不是绝对路径: ${path}`);
	}
}

export interface IPathInfo {
	/**
	 * 路径中除去根目录部分的剩余路径
	 * 例如对于路径 C:/Windows/System32，根目录为 C:/
	 * posix上始终是 /
	 */
	readonly root: string;
	/**
	 * 路径中除去根目录部分的剩余路径
	 * 例如对于路径 C:/Windows/System32，根目录为 C:/，剩余路径为 Windows/System32
	 */
	readonly path: string;
}

export interface IPathApi extends IPathNormalizedApi {
	/**
	 * 将路径中的反斜杠转换为正斜杠，连续的斜杠会被合并为一个
	 */
	normalizeSlash(path: string): string;
	/**
	 * 断言路径为绝对路径，如果不是则抛出错误，并返回normalizeSlash的结果
	 */
	assertAbsolute(path: string): string;
	/**
	 * 将路径拆分为根目录和剩余路径
	 */
	split(path: string): IPathInfo;
	/**
	 * 判断路径是否为根路径
	 */
	isRoot(path: string): boolean;
	/**
	 * 判断路径是否为绝对路径
	 */
	isAbsolute(path: string): boolean;
	/**
	 * 获取路径的根目录 (例如 C:/ 或 //server/share)
	 */
	rootOf(path: string): string;
	/**
	 * 获取路径的上级目录 (例如 C:/Windows -> C:/)
	 */
	dirname(path: string): string;
}

interface IPathNormalizedApi {
	normalizeSlash(path: string): string;
	_assertAbsolute(path: string): void;
	_split(path: string): IPathInfo;
	_isRoot(path: string): boolean;
	_isAbsolute(path: string): boolean;
	_rootOf(path: string): string;
	_dirname(path: string): string;
}

/** @internal */
export function makePathApi(module: IPathNormalizedApi, common: typeof import('./mpath.unified.js')): IPathApi {
	const assertAbsolute = (path: string) => {
		path = module.normalizeSlash(path);
		module._assertAbsolute(path);
		return path;
	};
	const r = {
		...module,
		...common,
		isRoot(path: string) {
			return module._isRoot(module.normalizeSlash(path));
		},
		isAbsolute(path: string) {
			return module._isAbsolute(module.normalizeSlash(path));
		},
		rootOf(path: string) {
			return module._rootOf(assertAbsolute(path));
		},
		dirname(path: string) {
			return module._dirname(assertAbsolute(path));
		},
		split(path: string) {
			return module._split(assertAbsolute(path));
		},
		assertAbsolute,
	};
	Object.freeze(r);
	return r;
}
