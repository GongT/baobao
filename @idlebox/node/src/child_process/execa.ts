import { isWindows, sepList, type IAsyncDisposable, type IDisposableEvents } from '@idlebox/common';
import type { Options as AsyncOptions, Result as AsyncResult, Result, ResultPromise, SyncOptions, SyncResult } from 'execa';
import { execa, execaSync } from 'execa';
import { checkChildProcessResult } from './error.js';

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
		env.PATH = undefined as any;
	}
	return env;
}

function handleError<T extends SyncResult<SyncOptions> | AsyncResult<AsyncOptions>>(result: T): T {
	if (result.exitCode !== 0) {
		throw new Error(`程序以状态 ${result.exitCode} 退出`);
	}
	if (result.signal) {
		throw new Error(`程序被信号 ${result.signal} 终止`);
	}
	return result;
}

/** @deprecated */
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

/** @deprecated */
export async function spawnWithoutOutput({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: AsyncOptions = {
		stdio: ['ignore', process.stderr, process.stderr],
		cwd,
		reject: false,
		env: sanitizeEnv(env, addonPath),
	};

	const e = await execa(cmd, args, opts);
	handleError(e);
}

/** @deprecated */
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
	return result.stdout as string;
}

/** @deprecated */
export async function spawnGetOutput({ exec, cwd, env, addonPath }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: AsyncOptions = {
		stdio: ['ignore', 'pipe', process.stderr],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		env: sanitizeEnv(env, addonPath),
	};

	const e = await execa(cmd, args, opts);
	const result = handleError(e);
	return result.stdout as string;
}

type EveryOut = {
	stdout: string;
	stderr: string;
	all: string;
};
/** @deprecated */
export async function spawnGetEverything({ exec, cwd, env, addonPath }: ICommand): Promise<EveryOut> {
	const [cmd, ...args] = exec;

	const result = await execa(cmd, args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		all: true,
		env: sanitizeEnv(env, addonPath),
	});
	handleError(result);
	return {
		all: result.all,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}

export type SpawnMethod<T extends AsyncOptions> = SpawnMethodTemplate<T> | SpawnMethodArray<T>;
export type AddonResultPromise<T extends AsyncOptions> = ResultPromise<T> & IDisposableEvents & IAsyncDisposable;

export class SpawnHelper<T extends AsyncOptions> {
	readonly spawn: SpawnMethod<T>;
	constructor(public readonly options: T) {
		this.spawn = createSpawnMethod(this.options);
	}

	extend<O extends AsyncOptions>(options: O): SpawnHelper<T & O> {
		return new SpawnHelper({
			...this.options,
			...options,
		});
	}
}

type TemplateExpressionItem = string | number | Result | SyncResult;
type TemplateExpression = TemplateExpressionItem | readonly TemplateExpressionItem[];

type SpawnMethodTemplate<T extends AsyncOptions> = (...commandline: TemplateString) => AddonResultPromise<T>;
type SpawnMethodArray<T extends AsyncOptions> = (program: string, argument?: string[]) => AddonResultPromise<T>;
type TemplateString = readonly [TemplateStringsArray, ...(readonly TemplateExpression[])];

function createSpawnMethod<T extends AsyncOptions>(_options: T): SpawnMethod<T> {
	return (_commandline: string | TemplateStringsArray, _args: TemplateExpression, ..._template: TemplateExpression[]): AddonResultPromise<T> => {
		throw new Error('not implemented');
	};
}
