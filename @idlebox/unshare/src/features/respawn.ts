import { globalObject } from '@idlebox/common';
import { commandInPathSync } from '@idlebox/node';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IReadonlyFilesystemPassingOptions } from '../children/readonly-fs.js';
import { CHILDREN_DIR, CONTAINER_ENV_VAR_NAME, GLOBAL_SIGNAL } from '../common/constants.js';
import { execveOrSpawn } from './execve.js';

export interface IReadonlyOptions {
	writable?: readonly string[];
	tmpfs?: readonly string[];
	volatile?: readonly string[];
	pid?: true;
}

/**
 * 在只读文件系统中重新运行当前进程（或者指定程序）
 * 在namespace中重新运行时，或不支持unshare时，该函数会返回
 *
 * 设置env.DONT_UNSHARE也会直接返回
 */

export function unshareReadonlyFileSystem(options: IReadonlyOptions) {
	if (globalObject[GLOBAL_SIGNAL] || process.env.DONT_UNSHARE) {
		return;
	}
	const unshareArgs = ['--mount', '--propagation=private', '--keep-caps'];
	if (options.pid) {
		unshareArgs.push('--pid', '--mount-proc', '--fork');
	}
	delete options.pid;

	const tmpfs = options.tmpfs ?? [];
	for (const item of tmpfs) {
		mkdirSync(item, { recursive: true });
	}
	for (const item of tmpfs) {
		if (item === '/tmp' || item.startsWith('/tmp/')) {
			throw new Error('/tmp is forced, no need to set tmpfs');
		}
	}

	const volatile = options.volatile ?? [];

	for (const item of volatile) {
		if (!existsSync(item)) {
			throw new Error(`Volatile path does not exist: ${item}`);
		}
	}

	const writable = (options.writable ?? []).filter((e) => {
		return existsSync(e);
	});

	const unshare = commandInPathSync('unshare', []);
	if (unshare) {
		execveOrSpawn({
			commands: [unshare, ...unshareArgs, process.execPath, ...process.execArgv, resolve(CHILDREN_DIR, 'readonly-fs.js')],
			extraEnv: {
				[CONTAINER_ENV_VAR_NAME]: JSON.stringify({
					options: {
						tmpfs: tmpfs,
						volatile: volatile,
						writable: writable,
					},
					entryFile: process.argv[1],
					argv: process.argv.slice(2),
				} satisfies IReadonlyFilesystemPassingOptions),
			},
			cwd: process.cwd(),
		});
	} else {
		// just return
	}
}
