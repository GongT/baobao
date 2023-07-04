import { path7za as originalPath7za } from '7zip-bin';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { basename, dirname } from 'path';
import { handleOutput, handleProgress, IStatusReport } from './outputStreams';

const path7za = originalPath7za.replace(/\.asar([\/\\])/, (_m0, sp) => {
	return '.asar.unpacked' + sp;
});

/** @extern */
export interface ProgramError extends Error {
	__cwd: string;
	__program: string;
	__programError: boolean;
	signal: string;
	status: number;
}

const outputArgs = [
	'-bso1', // standard output messages -> stdout
	'-bse1', // error messages -> stdout
	'-bsp2', // progress information -> stderr
];

function buildArgs(args: string[]) {
	return outputArgs.concat(
		args.filter((item) => {
			return !item.startsWith('-bs');
		})
	);
}

/** @extern */
export type ExtraSpawnOptions = Pick<SpawnOptions, 'cwd' | 'env' | 'uid' | 'gid' | 'shell'>;
export type MessageHandler = (data: string) => void;
export type ProgressHandler = (status: IStatusReport) => void;

export interface IToRun {
	commandline: string[];
	cwd: string;
	execute(handleData: MessageHandler, handleStatus: ProgressHandler): ChildProcess;
}

const quited = Symbol('quited');

function hasQuit(cp: ChildProcess): boolean {
	return (cp as any)[quited];
}

export function spawnSfx(sfxFile: string, targetDir: string, extra: ExtraSpawnOptions = {}): IToRun {
	const args = ['x', `-o${targetDir}`, '-y'];
	const cwd = dirname(sfxFile);
	const file = basename(sfxFile);

	return {
		commandline: [file, ...args],
		cwd,
		execute(handleData: MessageHandler, handleStatus: ProgressHandler) {
			const cp = spawn(file, args, {
				...extra,
				cwd,
				stdio: ['ignore', 'pipe', 'pipe'],
				detached: false,
				windowsHide: true,
			});

			handleQuit(cp);
			handleProgress(cp.stdout, true).on('data', (status: IStatusReport) => {
				if (status.messageOnly) {
					handleData(status.message);
				} else {
					handleStatus(status);
				}
			});

			return cp;
		},
	};
}

/** @internal */
export function spawn7z(args: string[], cli: boolean, extra: ExtraSpawnOptions = {}): IToRun {
	const cwd = extra.cwd || process.cwd();

	if (!cli && !args.includes('-y')) {
		args.unshift('-y');
	}

	args = buildArgs(args);

	const commandline = [path7za, ...args];
	return {
		commandline,
		cwd: cwd.toString(),
		execute(handleData: MessageHandler, handleStatus: ProgressHandler) {
			const cp = spawn(path7za, args, {
				...extra,
				stdio: [cli ? 'inherit' : 'ignore', 'pipe', 'pipe'],
				cwd,
				detached: false,
				windowsHide: true,
			});
			handleQuit(cp);
			handleOutput(cp.stdout).on('data', handleData);
			handleProgress(cp.stderr, false).on('data', handleStatus);

			return cp;
		},
	};
}

function handleQuit(cp: ChildProcess) {
	cp.once('exit', () => {
		Object.assign(cp, {
			[quited]: true,
		});
	});
}

export function processPromise(cp: ChildProcess, cmd: string[], cwd: string) {
	return new Promise<void>((resolve, reject) => {
		cp.once('error', reject);
		cp.once('exit', (code: number, signal: string) => {
			const e = StatusCodeError(code, signal, cwd, cmd);
			if (e) {
				reject(e);
			} else {
				resolve();
			}
		});
	});
}

function indentArgs(args: ReadonlyArray<string>) {
	return args
		.map((arg, index) => {
			return `  Argument[${index}] = ${arg}`;
		})
		.join('\n');
}

export function StatusCodeError(status: number, signal: string, _cwd: string, cmd: string[]): ProgramError | null {
	if (status === 0 && !signal) {
		return null;
	}
	const __program = `\`${cmd.join(' ')}\`
    Command = ${cmd[0]}
${indentArgs(cmd.slice(1))}
`;
	return Object.assign(
		new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`),
		{
			status,
			signal,
			__programError: true,
			__program,
			__cwd: cmd[2]!,
		}
	);
}

export function processQuitPromise(cp: ChildProcess): Promise<void> {
	if (hasQuit(cp)) {
		return Promise.resolve();
	}
	return new Promise((resolve) => {
		const to = setTimeout(() => {
			cp.kill('SIGKILL');
		}, 5000);
		cp.once('exit', (_code: number, _signal: string) => {
			clearTimeout(to);
			resolve();
		});
		cp.kill('SIGINT');
	});
}
