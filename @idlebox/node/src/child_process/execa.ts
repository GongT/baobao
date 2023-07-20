import '@gongt/fix-esm';
import { isWindows, sepList } from '@idlebox/common';
import type { ExecaReturnBase, SyncOptions } from 'execa';
import { execaSync } from 'execa';
import { checkChildProcessResult } from './error';

type ProcessEnv = Record<string, string> & {
	Path?: never;
};

export interface ICommand {
	exec: string[];
	addonPath?: string[];
	cwd?: string;
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

export function spawnWithoutOutputSync({ exec, cwd, env, addonPath }: ICommand): void {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', process.stderr, process.stderr],
		cwd,
		reject: false,
		env: sanitizeEnv(env, addonPath),
	};

	checkChildProcessResult(execaSync(cmd, args, opts));
}

export async function spawnWithoutOutput({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', process.stderr, process.stderr],
		cwd,
		reject: false,
		env: sanitizeEnv(env, addonPath),
	};

	const { execa } = await import('execa');
	const e = await execa(cmd, args, opts);
	handleError(e);
}

export function spawnGetOutputSync({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', 'pipe', process.stderr],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		env: sanitizeEnv(env, addonPath),
	};

	const result = handleError(execaSync(cmd, args, opts));
	return result.stdout;
}

export async function spawnGetOutput({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: SyncOptions = {
		stdio: ['ignore', 'pipe', process.stderr],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		env: sanitizeEnv(env, addonPath),
	};

	const { execa } = await import('execa');
	const e = await execa(cmd, args, opts);
	const result = handleError(e);
	return result.stdout;
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

	const { execa } = await import('execa');
	const result = await execa(cmd, args, opts);
	handleError(result);
	return result.all;
}
