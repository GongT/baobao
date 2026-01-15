import { lstatSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync } from 'node:fs';
import { lstat, mkdir, readlink, symlink, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export async function ensureLinkTarget(target, symlinkFile) {
	const stat = await lstat(symlinkFile).catch((e) => {
		if (e.code === 'ENOENT') {
			return false;
		}
		throw e;
	});
	if (stat) {
		if (stat.isSymbolicLink()) {
			const dest = await readlink(symlinkFile);
			const destAbs = resolve(dirname(symlinkFile), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		} else if (!stat.isFile()) {
			throw new Error(`ensureLinkTarget: ${target} is not regular file`);
		}
		await unlink(symlinkFile);
	}
	await mkdir(dirname(symlinkFile), { recursive: true });
	await symlink(target, symlinkFile, 'junction');
	return true;
}

export function ensureLinkTargetSync(target, symlink) {
	let stat;
	try {
		stat = lstatSync(symlink);
	} catch (e) {
		if (e.code === 'ENOENT') {
			stat = false;
		} else {
			throw e;
		}
	}
	if (stat) {
		if (stat.isSymbolicLink()) {
			const dest = readlinkSync(symlink);
			const destAbs = resolve(dirname(symlink), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		} else if (!stat.isFile()) {
			throw new Error(`ensureLinkTarget: ${target} is not regular file`);
		}
		unlinkSync(symlink);
	}
	mkdirSync(dirname(symlink), { recursive: true });
	symlinkSync(target, symlink, 'junction');
	return true;
}
