export interface IEnvironmentResult {
	value: string | undefined;
	name: string;
}

export function getEnvironment(name: string, env = process.env): IEnvironmentResult {
	if (env.hasOwnProperty(name)) {
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

export function deleteEnvironment(name: string, env = process.env) {
	for (const item of Object.keys(env)) {
		if (item.toLowerCase() === name) {
			delete env[item];
		}
	}
}

export function cleanupEnvironment(name: string, env = process.env) {
	if (env.hasOwnProperty(name)) {
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
