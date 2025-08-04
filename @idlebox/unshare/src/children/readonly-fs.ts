import { globalObject } from '@idlebox/common';
import { CONTAINER_ENV_VAR_NAME, GLOBAL_SIGNAL } from '../common/constants.js';
import { leaveOnlyFilesystem, mountBinding, mountOverlay, mountTmpfs, remountRootReadonly } from '../common/mount.js';
import type { IReadonlyOptions } from '../features/respawn.js';

export interface IReadonlyFilesystemPassingOptions {
	options: Required<Omit<IReadonlyOptions, 'pid'>>;
	entryFile: string;
	argv: string[];
}

const { options, entryFile, argv } = JSON.parse(process.env[CONTAINER_ENV_VAR_NAME]!) as IReadonlyFilesystemPassingOptions;

globalObject[GLOBAL_SIGNAL] = 'yes';

process.argv = [process.argv[0], entryFile, ...argv];
const oldCwd = process.cwd();
process.chdir('/');

await leaveOnlyFilesystem([...options.writable, ...options.volatile, oldCwd]);
await remountRootReadonly(options.writable);
process.chdir(oldCwd);

await Promise.all([
	//
	...options.writable.map((path) => mountBinding(path, path, true)),
	...options.tmpfs.map(mountTmpfs),
	...options.volatile.map((path) => mountOverlay(path, 'tmpfs', path)),
]);

await remountRootReadonly([...options.writable, ...options.tmpfs, ...options.volatile]);

// console.log(await findmnt([]));

await import(entryFile);
