import { mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * delete all content in a dir,
 * and create it if not exists
 * @public
 *
 * @param path - the path to the directory
 * @param create_not_exists - create the directory if it does not exist, defaults to true
 */
export async function emptyDir(path: string, create_not_exists = true) {
	let files: string[];
	try {
		files = await readdir(path);
	} catch (e: any) {
		if (e.code === 'ENOENT') {
			if (create_not_exists) await mkdir(path, { recursive: true });
			return;
		}
		throw e;
	}
	if (files.length === 0) return;

	for (const item of files) {
		await rm(resolve(path, item), { recursive: true });
	}
}
