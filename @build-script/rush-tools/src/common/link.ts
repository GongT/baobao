import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { relativePath } from '@idlebox/node';
import { access } from 'fs-extra';
import { F_OK } from 'constants';
import { dirname, resolve } from 'path';
import { RushProject } from '../api/rushProject';

export async function createLink(rush: RushProject, name: string, path: string) {
	const binTempDir = resolve(rush.tempRoot, 'bin');
	const distFile = resolve(binTempDir, name);

	const loader = relativePath(dirname(distFile), path);

	if (await ensureLinkTarget(loader, distFile)) {
		console.log('create link file %s => %s', relativePath(rush.projectRoot, distFile), loader);
	}
}

export async function createLinkIfNot(rush: RushProject, name: string, path: string) {
	const binTempDir = resolve(rush.tempRoot, 'bin');
	const distFile = resolve(binTempDir, name);

	try {
		await access(distFile, F_OK);
		console.log('target exists %s', relativePath(rush.projectRoot, distFile));
		return;
	} catch {
		return createLink(rush, name, path);
	}
}
