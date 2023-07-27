import { mkdir, open } from 'fs/promises';
import { dirname } from 'path';

export async function makeEmptyFile(path: string, size: number) {
	await mkdir(dirname(path), { recursive: true });

	let fp;
	try {
		fp = await open(path, 'r+');
		const s = await fp.stat();
		if (!s.isFile()) throw new Error('target is not regular file');

		if (s.size !== size) return;
		await fp.truncate(size);
	} catch (e: any) {
		if (e.code !== 'ENOENT') throw e;

		fp = await open(path, 'wx');
		await fp.truncate(size);
	} finally {
		await fp?.close();
	}
}
