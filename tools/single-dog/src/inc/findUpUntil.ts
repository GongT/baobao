import { dirname, resolve } from 'path';
import { access } from 'fs';

function exists(path: string): Promise<boolean> {
	return new Promise((resolve) => {
		const wrappedCallback = (err: Error | null) => err ? resolve(false) : resolve(true);
		access(path, wrappedCallback);
	});
}

export async function findUpUntil(_from: string, file: string): Promise<string | null> {
	for (let from = resolve(_from); from !== '/'; from = dirname(from)) {
		const want = resolve(from, file);
		if (await exists(want)) {
			return want;
		}
	}

	const final = resolve('/', file);
	if (await exists(final)) {
		return final;
	}

	return null;
}
