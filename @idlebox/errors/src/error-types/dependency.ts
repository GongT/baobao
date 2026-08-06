import type { ChildProcess, SignalsType } from '../common/type-shim.js';
import type { IErrorOptions } from '../common/type.js';
import { ProgramError } from './development.js';

export class DependencyError extends ProgramError {}

interface IChildProcessErrorOptions extends IErrorOptions {
	// 自定义
	readonly commandline?: readonly string[];
	readonly pid?: number;
	readonly workingDirectory?: string;

	// spawn 通用
	readonly status?: number | null;
	readonly signal?: SignalsType | string | null;
	readonly process?: ChildProcess;

	// spawn sync 的返回值
	readonly error?: Error;

	// spawn async 的process对象
	readonly signalCode?: SignalsType | string | null;
	readonly exitCode?: number | null;
	readonly spawnargs?: readonly string[];
	readonly spawnfile?: string;

	// execa 的process对象
	readonly nodeChildProcess?: ChildProcess;

	// execa await后的结果
	readonly escapedCommand?: string; // exec.join
	readonly cwd?: string; // workingDirectory
	readonly timedOut?: boolean;
	readonly isMaxBuffer?: boolean;
	readonly isCanceled?: boolean;
}

export class ChildProcessExitError extends DependencyError {
	public pid?: number;
	public commandline?: readonly string[];
	public workingDirectory?: string;
	public exitCode?: number;
	public signal?: SignalsType | string;
	public process?: ChildProcess;

	static describe(result: IChildProcessErrorOptions): string {
		const getter = (key: keyof IChildProcessErrorOptions) => {
			if (key in result) {
				return result[key];
			}
			if (result.nodeChildProcess && key in result.nodeChildProcess) {
				return result.nodeChildProcess[key as keyof ChildProcess];
			}
			return undefined;
		};
		let name = '子进程';
		if (result.escapedCommand) {
			name += `${result.escapedCommand}`;
		} else if (result.commandline) {
			name += `${result.commandline.join(' ')}`;
		} else if (result.spawnfile) {
			name += `${result.spawnfile} ${result.spawnargs?.join(' ')}`;
		}
		let ex = '';
		const gcwd = getter('cwd');
		if (result.workingDirectory ?? gcwd) {
			ex += `CWD=${result.workingDirectory ?? gcwd}`;
		}
		if (result.pid) {
			if (ex) {
				ex += ', ';
			}
			ex += `PID=${result.pid}`;
		}
		if (ex) {
			name += ` (${ex})`;
		}
		return name;
	}

	constructor({
		pid,
		commandline,
		escapedCommand,
		workingDirectory,
		cwd,
		exitCode,
		status,
		signal,
		signalCode,
		process,
		timedOut,
		isMaxBuffer,
		isCanceled,
		...opts
	}: IChildProcessErrorOptions) {
		let message = '';
		message += pid ? `子进程"${pid}"` : '未知ID子进程';
		if (timedOut) {
			message += '超时终止, ';
		} else if (isCanceled) {
			message += '被取消, ';
		} else if (isMaxBuffer) {
			message += '输出缓冲区溢出, ';
		} else {
			message += '非预期退出, ';
		}
		if (typeof (exitCode ?? status) === 'number') {
			message += `返回"${exitCode ?? status}"`;
		} else if (signal || signalCode) {
			message += `信号"${signal ?? signalCode}"`;
		} else {
			message += '未能启动';
		}
		if (commandline) {
			message += `\n  命令行: ${commandline.join(' ')}`;
		} else if (escapedCommand) {
			message += `\n  命令行: ${escapedCommand}`;
		} else if (opts.spawnfile) {
			message += `\n  命令行: ${opts.spawnfile} ${opts.spawnargs?.join(' ')}`;
		}
		if (workingDirectory ?? cwd) {
			message += `\n  工作目录: ${workingDirectory ?? cwd}`;
		}

		const result = opts as any;
		if (!opts.cause) {
			if (result.error) {
				opts.cause = result.error;
			} else if (result instanceof Error) {
				opts.cause = result;
			} else if (result.message) {
				opts.cause = new Error(result.message);
			}
		}

		super(message, opts);

		this.pid = pid ?? undefined;
		this.commandline = commandline ?? (escapedCommand ? [escapedCommand] : undefined);
		this.workingDirectory = workingDirectory ?? cwd ?? undefined;
		this.exitCode = exitCode ?? status ?? undefined;
		this.signal = signal ?? signalCode ?? undefined;
		this.process = process ?? undefined;
	}
}
