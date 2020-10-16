import execa from 'execa';
import { checkChildProcessResult } from './error';

export interface Sync {
	sync: true;
}
export interface Async {
	sync?: boolean;
}
export interface ICommand {
	exec: string[];
	cwd?: string;
	sync?: boolean;
}

function handleError<T extends execa.ExecaReturnBase<string>>(result: T): T {
	if (result.exitCode !== 0) {
		throw new Error('command exit with code ' + result.exitCode);
	} else if (result.signal) {
		throw new Error('command killed by signal ' + result.signal);
	}
	return result;
}

export function spawnWithoutOutput(opt: ICommand & Sync): void;
export function spawnWithoutOutput(opt: ICommand & Async): Promise<void>;
export function spawnWithoutOutput({ exec, cwd, sync }: ICommand & Async): void | Promise<void> {
	const [cmd, ...args] = exec;
	const opts: execa.SyncOptions = {
		stdio: ['ignore', process.stderr, process.stderr],
		cwd,
		reject: false,
	};

	if (sync) {
		checkChildProcessResult(execa.sync(cmd, args, opts));
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
export function spawnGetOutput({ exec, cwd, sync }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: execa.SyncOptions = {
		stdio: ['ignore', 'pipe', process.stderr],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
	};

	if (sync) {
		const result = handleError(execa.sync(cmd, args, opts));
		return result.stdout;
	} else {
		return execa(cmd, args, opts)
			.then(handleError)
			.then((result) => {
				return result.stdout;
			});
	}
}

export function spawnGetEverything({ exec, cwd }: ICommand) {
	const [cmd, ...args] = exec;
	const opts: execa.SyncOptions = {
		stdio: ['ignore', 'pipe', 'pipe'],
		cwd,
		reject: false,
		stripFinalNewline: true,
		encoding: 'utf8',
		all: true,
	};

	return execa(cmd, args, opts)
		.then(handleError)
		.then((result) => {
			return result.all;
		});
}
