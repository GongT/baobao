import { commandInPath } from '@idlebox/node';
import { execa, ExecaError, type Options } from 'execa';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { inspect } from 'node:util';
import { inside } from './path-calc.js';
import type { IMountInfo } from '../features/types.js';
import { detectVsCode } from './vscode.js';

let mountBinPromise: undefined | Promise<string>;

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

	try {
		await execWithoutOutput`${mount} --mkdir --rbind ${source} ${target} -o ${writable ? 'rw' : 'ro'}`;
	} catch (e) {
		throwErrorWithStdout(e, 'failed bind mount');
	}
}

export async function mountTmpfs(path: string) {
	// console.log('mount tmpfs!', path);
	const mount = await findMountBin();
	await mkdir(path, { recursive: true });
	try {
		await execWithoutOutput`${mount} -t tmpfs --source tmpfs --target ${path}`;
	} catch (e) {
		throwErrorWithStdout(e, 'failed mount tmpfs');
	}
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

	try {
		await execWithoutOutput`${mount} --mkdir -t overlay -o lowerdir=${lower},upperdir=${upper},workdir=/tmp/overlay/${id}/work --source overlayfs --target ${target}`;
	} catch (e) {
		throwErrorWithStdout(e, 'failed mount overlay');
	}
}

interface IFindMntResult {
	filesystems: IMountInfo[];
}

// const extraLeave = ['/proc', '/dev', '/sys'];

export async function recreateRootFilesystem(keep_visible: readonly string[]) {
	const newRoot = '/tmp/rootfs';
	await mountTmpfs(newRoot);

	await mountOverlay('/', 'tmpfs', newRoot);

	// console.log(filesystems);

	for (const path of keep_visible.toSorted(shortToLong)) {
		await mountBinding(path, `${newRoot}${path}`, false);
	}
	await mountBinding(dirname(process.execPath), `${newRoot}${dirname(process.execPath)}`, false);
	await mountBinding('/proc', `${newRoot}/proc`, true);
	await mountBinding('/dev', `${newRoot}/dev`, true);
	await mountTmpfs(`${newRoot}/tmp`);

	const vscode = detectVsCode();
	if (vscode) {
		await mountBinding(vscode, `${newRoot}${vscode}`, false);
	}

	return newRoot;
}

function throwErrorWithStdout(e: unknown, extraMessage?: string) {
	if (isNoOutputError(e)) {
		console.error(`\ncommand: ${e.escapedCommand}\n\x1B[0;3m${e.all}\x1B[0m\n`);
		if (!extraMessage) {
			extraMessage = `process failed`;
		}
		throw new Error(`${extraMessage}: ${e.originalMessage || e.shortMessage || e.message}`);
	} else {
		throw e;
	}
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

		try {
			await execWithoutOutput`${mount} ${path} -o remount,bind,ro`;
		} catch (e) {
			console.log(inspect(await findmnt([]), { breakLength: 140, compact: true }));
			throwErrorWithStdout(e, 'failed remount bind');
		}
	}
}

export async function findmnt(filter: readonly string[]) {
	const { stdout } = await execa({ encoding: 'ascii' })`findmnt ${filter} -o+PROPAGATION --json --list`;
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

export function setVerbose(v: boolean) {
	if (v) {
		execWithoutOutput = execa({ ...noOutputOptions, verbose: 'short' }) as any;
	} else {
		execWithoutOutput = execa(noOutputOptions);
	}
}

const noOutputOptions = {
	stdio: ['ignore', 'pipe', 'pipe'],
	all: true,
	encoding: 'utf8',
	env: {
		LANG: 'C',
	},
} as const;
let execWithoutOutput = execa(noOutputOptions);
const isNoOutputError = isExecaError<typeof noOutputOptions>;

function isExecaError<T extends Options>(e: unknown): e is ExecaError<T> {
	return e instanceof ExecaError;
}

export function shortToLong(a: string, b: string) {
	return a.length - b.length;
}
