import { mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * delete all content in a dir,
 * and create it if not exists
 * @public
 */
export async function emptyDir(path: string, create_if_nexists = true) {
	let files;
	try {
		files = await readdir(path);
	} catch (e: any) {
		if (e.code === 'ENOENT') {
			if (create_if_nexists) await mkdir(path, { recursive: true });
			return;
		}
		throw e;
	}
	if (files.length === 0) return;

	for (const item of files) {
		await rm(resolve(path, item), { recursive: true });
	}
}
