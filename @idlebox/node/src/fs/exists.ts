import { access, accessSync } from 'fs';

export function existsSync(path: string): boolean {
	try {
		accessSync(path);
		return true;
	} catch (e) {
		return false;
	}
}

export function exists(path: string): Promise<boolean> {
	return new Promise((resolve) => {
		const wrappedCallback = (err: Error | null) => (err ? resolve(false) : resolve(true));
		access(path, wrappedCallback);
	});
}
