import { commandInPath } from '@idlebox/node';
import { execa } from 'execa';
import { mkdir } from 'fs/promises';

let mountBinPromise: undefined | Promise<string>;

const verbose = undefined;

function findMountBin() {
	if (!mountBinPromise) {
		mountBinPromise = commandInPath('mount').then((bin) => {
			if (!bin) throw new Error('missing mount command in PATH');
			mountBinPromise = Promise.resolve(bin);
			return bin;
		});
	}
	return mountBinPromise;
}

export async function mountBinding(source: string, target: string, writable: boolean) {
	const mount = await findMountBin();

	await execa(mount, ['--rbind', source, target, '-o', writable ? 'rw' : 'ro'], {
		stdio: 'inherit',
		verbose,
	});
}

export async function mountTmpfs(path: string) {
	// console.log('mount tmpfs!', path);
	const mount = await findMountBin();
	await mkdir(path, { recursive: true });
	await execa({ stdio: 'inherit', verbose })`${mount} -t tmpfs --source tmpfs --target ${path}`;
}

let guid = 0;
export async function mountOverlay(lower: string, upper: string, target: string) {
	const mount = await findMountBin();
	const id = guid++;

	if (upper === 'tmpfs') {
		upper = `/tmp/overlay/${id}/upper`;
		await mkdir(upper, { recursive: true });
	}

	await mkdir(`/tmp/overlay/${id}/work`, { recursive: true });

	await execa({ stdio: 'inherit', verbose })`${mount} -t overlay -o lowerdir=${lower},upperdir=${upper},workdir=/tmp/overlay/${id}/work --source overlayfs --target ${target}`;
}

interface IMountInfo {
	target: string;
	source: string;
	fstype: string;
	options: string;
}

interface IFindMntResult {
	filesystems: IMountInfo[];
}

const extraLeave = ['/proc', '/dev', '/sys'];

function inside(path: string, containers: readonly string[]) {
	for (const what of containers) {
		if (path === what || path.startsWith(`${what}/`)) {
			return true;
		}
	}
	return false;
}

function outside(container: string, files: readonly string[]) {
	for (const file of files) {
		if (container === file || file.startsWith(`${container}/`)) {
			return true;
		}
	}
	return false;
}

export async function leaveOnlyFilesystem(files: readonly string[]) {
	const toUnmount = [];
	const filesystems = await findmnt([]);

	for (const { target } of filesystems.toReversed()) {
		if (target === '/') continue;
		if (inside(target, extraLeave)) continue;
		if (outside(target, files)) continue;

		toUnmount.push(target);
	}

	if (toUnmount.length) {
		await execa({ stdio: 'inherit', verbose })`umount ${toUnmount}`;
	}
	// for (const path of toUnmount) {
	// 	await execa({ stdio: 'inherit', verbose })`umount ${path}`;
	// }

	await mountTmpfs('/tmp');
}

export async function remountRootReadonly(keeps: readonly string[]) {
	const mount = await findMountBin();

	const filesystems = await findmnt(['--options', 'rw']);

	// console.log(readdirSync('/dev'));

	const toRemount = new Map<string, boolean>();
	for (const { target, options } of filesystems.toReversed()) {
		if (`,${options},`.includes(',ro,')) continue;
		if (target === '/dev/shm' || target === '/dev') continue;
		if (inside(target, ['/tmp', '/proc'])) continue;

		toRemount.set(target, true);
	}

	for (const keep of keeps) {
		const mostNear = findMostNear(keep, Array.from(toRemount.keys()));
		if (mostNear) {
			toRemount.set(mostNear, false);
		}
	}

	for (const [path, shouldRemount] of toRemount.entries()) {
		if (!shouldRemount) continue;

		await execa({ all: true, verbose })`${mount} ${path} -o remount,bind,ro`;
	}
}

export async function findmnt(filter: readonly string[]) {
	const { stdout } = await execa({ encoding: 'ascii' })`findmnt ${filter} --json --list`;
	const { filesystems } = JSON.parse(stdout) as IFindMntResult;
	return filesystems;
}

function findMostNear(file: string, containers: readonly string[]) {
	containers = containers.filter((e) => {
		return inside(file, [e]);
	});

	if (containers.length === 0) return undefined;

	let longest = '';
	for (const path of containers) {
		if (path.length > longest.length) {
			longest = path;
		}
	}
	return longest;
}
