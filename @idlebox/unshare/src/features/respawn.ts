import { commandInPathSync } from '@idlebox/node';
import { execa, type Options } from 'execa';
import { isAbsolute, normalize, resolve } from 'node:path';
import type { IReadonlyFilesystemPassingOptions } from '../children/readonly-fs.js';
import { CHILDREN_DIR, CONTAINER_ENV_VAR_NAME } from '../common/constants.js';
import { inside } from '../common/path-calc.js';
import type { FsNodeType } from './types.js';
import { execveOrSpawn } from './execve.js';

export interface IFilesystemNode {
	readonly path: string;
	readonly type: FsNodeType;
}

export interface IReadonlyOptions {
	/**
	 * 所有挂载点，一定要注意顺序
	 */
	volumes: readonly IFilesystemNode[];
	pid?: true;
	verbose?: boolean;
}

let _unshare: string;
function getUnshareBin(required: false): undefined | string;
function getUnshareBin(required: true): string;
function getUnshareBin(required: boolean) {
	if (!_unshare) {
		const unshare = commandInPathSync('unshare', []);
		if (!unshare) {
			if (required) {
				throw new Error('unshare not found');
			}
			return undefined;
		} else {
			_unshare = unshare;
		}
	}
	return _unshare;
}

const disallowPaths = ['/', '/tmp', '/dev', '/proc'];

function makeOptions(options: IReadonlyOptions) {
	const unshareArgs = ['--mount', '--propagation=private', '--keep-caps'];
	if (options.pid) {
		unshareArgs.push('--pid', '--mount-proc', '--fork');
	}

	const clone: IFilesystemNode[] = [];
	for (const volume of options.volumes) {
		if (!isAbsolute(volume.path)) throw new Error(`path ${volume.path} should be absolute`);

		if (disallowPaths.includes(volume.path)) throw new Error(`path ${volume.path} is not allowed`);
		if (inside(process.execPath, [volume.path])) throw new Error(`path ${volume.path} will hide nodejs`);

		clone.push({
			path: normalize(volume.path),
			type: volume.type,
		});
	}

	const mixed = new Set(clone.map((e) => e.path));
	if (mixed.size !== clone.length) {
		throw new Error('Path duplication detected');
	}

	return {
		unshareArgs,
		options: {
			volumes: clone,
			verbose: options.verbose ?? false,
		} satisfies IReadonlyFilesystemPassingOptions['options'],
	};
}

/**
 * 在只读文件系统中重新运行当前进程（或者指定程序）
 * 在namespace中重新运行时，或不支持unshare时，该函数会返回
 *
 * 设置env.DONT_UNSHARE也会直接返回
 *
 * @param singleton_signal 唯一但不随机字符串
 */
export function unshareReadonlyFileSystem(singleton_signal: string, options: IReadonlyOptions) {
	if (process.env.DONT_UNSHARE || process.env[singleton_signal]) {
		return;
	}

	if (!getUnshareBin(false)) {
		return;
	}

	unshareReadonlyFileSystemWithCommand({
		options,
		command: {
			scriptFile: process.argv[1],
			argv: process.argv.slice(2),
		},
		env: {
			[singleton_signal]: 'yes',
		},
	});
}

interface ICommandOptions {
	readonly options: IReadonlyOptions;
	readonly command: {
		readonly scriptFile: string;
		readonly argv: readonly string[];
	};
	readonly env?: Record<string, string>;
	readonly cwd?: string;
}

export function unshareReadonlyFileSystemWithCommand(exec: ICommandOptions) {
	const { options: container_options, unshareArgs } = makeOptions(exec.options);
	const env_content = {
		options: container_options,
		entryFile: exec.command.scriptFile,
		argv: exec.command.argv,
	};

	const commandline = [getUnshareBin(true), ...unshareArgs, process.execPath, ...process.execArgv, resolve(CHILDREN_DIR, 'readonly-fs.js')];
	execveOrSpawn({
		commands: commandline,
		extraEnv: {
			TMPDIR: '/tmp',
			...(exec.env || {}),
			[CONTAINER_ENV_VAR_NAME]: JSON.stringify(env_content),
		},
		cwd: exec.cwd ?? process.cwd(),
	});
}

export function spawnReadonlyFileSystemWithCommand<T extends Options>(exec: Omit<ICommandOptions, 'cwd' | 'env'>, options: T = {} as T) {
	const { options: container_options, unshareArgs } = makeOptions(exec.options);
	const env_content = {
		options: container_options,
		entryFile: exec.command.scriptFile,
		argv: exec.command.argv,
	};

	const mapped: T = {
		...options,
		env: {
			TMPDIR: '/tmp',
			...(options.env || {}),
			[CONTAINER_ENV_VAR_NAME]: JSON.stringify(env_content),
		},
	};

	return execa('unshare', [...unshareArgs, process.execPath, ...process.execArgv, resolve(CHILDREN_DIR, 'readonly-fs.js')], mapped);
}
