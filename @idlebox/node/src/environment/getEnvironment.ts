export interface IEnvironmentResult {
	/**
	 * 环境变量的值，如果不存在则为 undefined
	 */
	value: string | undefined;
	/**
	 * 环境变量的实际名称
	 */
	name: string;
}

/**
 * 获取环境变量
 * 大小写不敏感
 */
export function getEnvironment(name: string, env = process.env): IEnvironmentResult {
	if (Object.hasOwn(env, name)) {
		return {
			value: env[name],
			name: name,
		};
	}
	name = name.toLowerCase();
	for (const item of Object.keys(env)) {
		if (item.toLowerCase() === name) {
			return {
				value: env[item],
				name: item,
			};
		}
	}

	return {
		value: undefined,
		name,
	};
}

/**
 * 删除环境变量，大小写不敏感
 */
export function deleteEnvironment(name: string, env = process.env) {
	for (const item of Object.keys(env)) {
		if (item.toLowerCase() === name) {
			delete env[item];
		}
	}
}

/**
 * 清理环境变量，保留第一个匹配的，删除其他重复的，大小写不敏感
 *
 * 优先保留与name大小写完全相同的，如果没有则保留第一个
 */
export function cleanupEnvironment(name: string, env = process.env) {
	if (Object.hasOwn(env, name)) {
		for (const item of Object.keys(env)) {
			if (item.toLowerCase() === name && name !== item) {
				delete env[item];
			}
		}
	} else {
		let first = true;
		for (const item of Object.keys(env)) {
			if (item.toLowerCase() === name) {
				if (first) {
					first = false;
					continue;
				}
				delete env[item];
			}
		}
	}
}
