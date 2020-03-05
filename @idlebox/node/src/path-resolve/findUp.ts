import { dirname, resolve } from 'path';
import { exists, existsSync } from '../fs/exists';

export async function findUpUntil(from: string, file: string): Promise<string | null> {
	for (let _from = resolve(from); _from !== '/'; _from = dirname(_from)) {
		const want = resolve(_from, file);
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

export function findUpUntilSync(from: string, file: string): string | null {
	for (let _from = resolve(from); _from !== '/'; _from = dirname(_from)) {
		const want = resolve(_from, file);
		if (existsSync(want)) {
			return want;
		}
	}

	const final = resolve('/', file);
	if (existsSync(final)) {
		return final;
	}

	return null;
}
