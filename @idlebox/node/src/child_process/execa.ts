import { isWindows, sepList } from '@idlebox/common';
import { execa, ExecaReturnBase, execaSync, SyncOptions } from 'execa';
import { checkChildProcessResult } from './error';

export interface Sync {
	sync: true;
}
export interface Async {
	sync?: boolean;
}

type ProcessEnv = Record<string, string> & {
	Path?: never;
};

export interface ICommand {
	exec: string[];
	addonPath?: string[];
	cwd?: string;
	sync?: boolean;
	env?: ProcessEnv;
}

function sanitizeEnv(env?: ProcessEnv, addonPath?: string[]) {
	if (!env) return undefined;

	if (addonPath) {
		env.PATH = addonPath.join(sepList) + sepList + (env.PATH ?? process.env.PATH);
	}
	if (isWindows) {
		(env as any).Path = env.PATH.replace(/:/g, sepList);
		delete env.PATH;
	}
	return env;
}

function handleError<T extends ExecaReturnBase<string>>(result: T): T {
	if (result.exitCode !== 0) {
		throw new Error('command exit with code ' + result.exitCode);
	} else if (result.signal) {
		throw new Error('command killed by signal ' + result.signal);
	}
	return result;
}

export function spawnWithoutOutput(opt: ICommand & Sync): void;
export function spawnWithoutOutput(opt: ICommand & Async): Promise<void>;
export function spawnWithoutOutput({ exec, cwd, sync, env, addonPath }: ICommand & Async): void | Promise<void> {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', process.stderr, process.stderr],
		cwd,
		reject: false,
		env: sanitizeEnv(env, addonPath),
	};

	if (sync) {
		checkChildProcessResult(execaSync(cmd, args, opts));
	} else {
		return execa(cmd, args, opts)
			.then(checkChildProcessResult)
			.then(() => {
				return;
			});
	}
}

export function spawnGetOutput(opt: ICommand & Sync): string;
export function spawnGetOutput(opt: ICommand & Async): Promise<string>;
export function spawnGetOutput({ exec, cwd, sync, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', 'pipe', process.stderr],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		env: sanitizeEnv(env, addonPath),
	};

	if (sync) {
		const result = handleError(execaSync(cmd, args, opts));
		return result.stdout;
	} else {
		return execa(cmd, args, opts)
			.then(handleError)
			.then((result) => {
				return result.stdout;
			});
	}
}

export async function spawnGetEverything({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', 'pipe', 'pipe'],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		all: true,
		env: sanitizeEnv(env, addonPath),
	};

	const result = await execa(cmd, args, opts);
	handleError(result);
	return result.all;
}
