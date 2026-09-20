import type { ChildProcess, SignalsType } from '../common/type-shim.js';
import type { IErrorOptions } from '../common/type.js';
import { ProgramError } from './development.js';

export class DependencyError extends ProgramError {}

type IChildProcessErrorOptions = IResult & IErrorOptions;

interface IResult {
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
	public readonly pid?: number;
	public readonly commandline?: readonly string[];
	public readonly workingDirectory?: string;
	public readonly exitCode?: number;
	public readonly signal?: SignalsType | string;
	public readonly process?: ChildProcess;
	public readonly originalMessage?: string;

	/**
	 * 描述一个子进程的信息（非结果）
	 */
	static describe = describe;

	/**
	 * 描述一个结果
	 */
	static status = status;

	constructor(input: IChildProcessErrorOptions) {
		const { boundary, cause, stack, ..._info } = input;
		const opts: IErrorOptions = { boundary, cause, stack };
		const info: IResult = _info;

		let message = fTitle(info);

		const cmd = fCmd(info);
		if (cmd) {
			message += `(${cmd})`;
		}

		message += ` ${fStatus(info) ?? '非预期退出'}`;
		const originalMessage = message;

		const wd = getter(input, 'cwd');
		if (info.workingDirectory ?? wd) {
			message += `\n  工作目录: ${info.workingDirectory ?? wd}`;
		}

		const result = input as any;
		if (!opts.cause) {
			if (result.error) {
				opts.cause = result.error;
			} else if (result.message) {
				opts.cause = result;
			}
		}

		super(message, opts);

		this.originalMessage = originalMessage;
		this.pid = info.pid ?? undefined;
		this.commandline = info.commandline ?? (info.escapedCommand ? [info.escapedCommand] : undefined);
		this.workingDirectory = info.workingDirectory ?? getter(input, 'cwd') ?? undefined;
		this.exitCode = info.exitCode ?? info.status ?? undefined;
		this.signal = info.signal ?? info.signalCode ?? undefined;
		this.process = info.nodeChildProcess ?? info.process ?? undefined;
	}

	get nodeChildProcess(): ChildProcess | undefined {
		return this.process ?? undefined;
	}
}

function fTitle(info: IChildProcessErrorOptions): string {
	const pid = getter(info, 'pid');
	if (pid) {
		return `进程${pid}`;
	} else {
		console.error('Unknown process ID', info, new Error('this stack'));
		return '未知ID进程';
	}
}

function fStatus(info: IChildProcessErrorOptions) {
	if (info.timedOut) {
		return '超时终止';
	} else if (info.isCanceled) {
		return '被取消';
	} else if (info.isMaxBuffer) {
		return '输出缓冲区溢出';
	} else if (typeof (info.exitCode ?? info.status) === 'number') {
		return `返回"${info.exitCode ?? info.status}"`;
	} else if (info.signal || info.signalCode) {
		return `收到信号"${info.signal ?? info.signalCode}"`;
	} else {
		return undefined;
	}
}

function fCmd(info: IChildProcessErrorOptions) {
	if (info.commandline) {
		return info.commandline.join(' ');
	} else if (info.escapedCommand) {
		return info.escapedCommand;
	} else if (info.spawnfile) {
		return `${info.spawnfile} ${info.spawnargs?.join(' ')}`;
	} else {
		return undefined;
	}
}

function getter(result: IChildProcessErrorOptions, key: keyof IChildProcessErrorOptions): any {
	if (key in result) {
		return result[key];
	}
	if (result.nodeChildProcess && key in result.nodeChildProcess) {
		return result.nodeChildProcess[key as keyof ChildProcess];
	}
	return undefined;
}

function describe(result: IChildProcessErrorOptions): string {
	let name = '子进程';
	if (result.escapedCommand) {
		name += result.escapedCommand;
	} else if (result.commandline) {
		name += result.commandline.join(' ');
	} else if (result.spawnfile) {
		name += `${result.spawnfile} ${result.spawnargs?.join(' ')}`;
	}

	let ex = '';
	const gcwd = getter(result, 'cwd');
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

function status(result: IChildProcessErrorOptions): string {
	return fTitle(result) + fStatus(result);
}
