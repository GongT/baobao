import { access, accessSync } from 'fs';

/** @deprecated moved into node-helpers */
export function existsSync(path: string): boolean {
	try {
		accessSync(path);
		return true;
	} catch (e) {
		return false;
	}
}

/** @deprecated moved into node-helpers */
export function exists(path: string): Promise<boolean> {
	return new Promise((resolve) => {
		const wrappedCallback = (err: Error | null) => err ? resolve(false) : resolve(true);
		access(path, wrappedCallback);
	});
}
