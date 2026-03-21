import type { ChildProcess, SignalsType } from '../common/type-shim.js';
import type { IErrorOptions } from '../common/type.js';
import { ProgramError } from './development.js';

export class DependencyError extends ProgramError {}

interface IChildProcessErrorOptions extends IErrorOptions {
	readonly commandline?: readonly string[];
	readonly pid?: number;
	readonly workingDirectory?: string;
	readonly exitCode?: number;
	readonly signal?: SignalsType;
	readonly process?: ChildProcess;
}

export class ChildProcessExitError extends DependencyError {
	public pid?: number;
	public commandline?: readonly string[];
	public workingDirectory?: string;
	public exitCode?: number;
	public signal?: SignalsType;
	public process?: ChildProcess;

	constructor({ pid, commandline, workingDirectory, exitCode, signal, process, ...opts }: IChildProcessErrorOptions) {
		let message = '';
		message += pid ? `子进程 ${pid} ` : '未知子进程';
		message += '非预期退出, ';
		if (exitCode) {
			message += `返回 ${exitCode}`;
		} else if (signal) {
			message += `信号 ${signal}`;
		} else {
			message += '可能未正常启动';
		}
		if (commandline) {
			message += `\n  命令行: ${commandline.join(' ')}`;
		}
		if (workingDirectory) {
			message += `\n  工作目录: ${workingDirectory}`;
		}

		super(message, opts);

		this.pid = pid;
		this.commandline = commandline;
		this.workingDirectory = workingDirectory;
		this.exitCode = exitCode;
		this.signal = signal;
		this.process = process;
	}
}
