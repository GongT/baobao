import { commandInPathSync } from '@idlebox/node';
import { execveOrSpawn } from '../autoindex.generated.js';
import { CONTAINER_ENV_VAR_NAME } from '../common/constants.js';
import { mountBinding, mountOverlay, mountTmpfs, recreateRootFilesystem, setVerbose } from '../common/mount.js';
import { inside } from '../common/path-calc.js';
import type { IReadonlyOptions } from '../features/respawn.js';
import { FsNodeType } from '../features/types.js';

export interface IReadonlyFilesystemPassingOptions {
	options: Required<Omit<IReadonlyOptions, 'pid'>>;
	entryFile: string;
	argv: string[];
}

const { options, entryFile, argv } = JSON.parse(process.env[CONTAINER_ENV_VAR_NAME]!) as IReadonlyFilesystemPassingOptions;
delete process.env[CONTAINER_ENV_VAR_NAME];
// process.stderr.write(`=============== ${[entryFile, ...argv].join(' ')}\n`);
// console.log(options);

if (options.verbose) {
	setVerbose(true);
}

const newArgv = [process.argv[0], entryFile, ...argv];
const oldCwd = process.cwd();
process.chdir('/');

const extra_keep = [oldCwd];
for (const { type, path } of options.volumes) {
	switch (type) {
		case FsNodeType.tmpfs:
		case FsNodeType.readonly:
		case FsNodeType.passthru:
		case FsNodeType.volatile:
			if (inside(oldCwd, [path])) {
				extra_keep.shift();
				break;
			}
			break;
		default:
			throw new Error(`unknown fs type: ${type}`);
	}
}

const newRoot = await recreateRootFilesystem(extra_keep);
for (const { type, path } of options.volumes) {
	switch (type) {
		case FsNodeType.tmpfs:
			await mountTmpfs(`${newRoot}/${path}`);
			break;
		case FsNodeType.readonly:
			await mountBinding(path, `${newRoot}/${path}`, false);
			break;
		case FsNodeType.passthru:
			await mountBinding(path, `${newRoot}/${path}`, true);
			break;
		case FsNodeType.volatile:
			await mountOverlay(path, 'tmpfs', `${newRoot}/${path}`);
			break;
		default:
			throw new Error(`unknown fs type: ${type}`);
	}
}

const unshare = commandInPathSync('unshare');
if (!unshare) {
	throw new Error('the "unshare" binary has gone after unshare');
}

const commandline = [unshare, `--wd=${oldCwd}`, `--root=${newRoot}`, ...newArgv];
// console.log('will be unshare:', commandline);
execveOrSpawn({
	commands: commandline,
	// cwd: `${newRoot}/${oldCwd}`,
	cwd: '/',
});
// console.log(await findmnt([]));
