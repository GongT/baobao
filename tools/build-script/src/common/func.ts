import { TaskFunction } from 'gulp';

export function isArrayOfString(arr: string[]) {
	if (!Array.isArray(arr)) {
		return false;
	}
	return arr.every(item => typeof item === 'string');
}

export function functionWithName<T extends TaskFunction>(fn: T, displayName: string, description: string): T {
	return Object.assign(
		fn,
		{
			displayName,
			description,
		},
	);
}
