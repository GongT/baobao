import { logger } from '@idlebox/cli';
import { convertCaughtError, createStackTraceHolder } from '@idlebox/common';
import { registerNodejsGlobalTypedErrorHandler, shutdown } from '@idlebox/node';
import { execa, ExecaError } from 'execa';
import { constants } from 'node:os';

const env = {
	DEBUG_LEVEL: logger.verbose.isEnabled ? 'verbose' : logger.debug.isEnabled ? 'debug' : undefined,
};

export function registerLogError() {
	registerNodejsGlobalTypedErrorHandler(ExecaError, (err) => {
		logger.error`捕获到全局异常，执行命令失败: commandline<${err.command}>`;
		logger.error`    工作目录: long<${err.cwd}>`;
		for (const line of err.stack.split('\n')) {
			logger.warn(line);
		}
		shutdown(1);
	});
}

/**
 * 执行pnpm命令，可能产生交互，所有io直接继承，不反悔任何东西
 *
 * 无法确定或非0退出码的情况会退出当前进程
 */
export async function execPnpmUser(cwd: string, args: string[] = []) {
	try {
		logger.debug`执行命令: pnpm commandline<${args}>`;
		await execa('pnpm', args, {
			stdio: 'inherit',
			cwd,
			buffer: false,
			env,
		});
	} catch (e) {
		debugFailedCommand(e, ['pnpm', ...args], cwd, true);
		logger.debug`进程即将退出`;
		shutdown(1);
	}
}
const colorReg = /\x1B\[[0-9;]+?m|\x1Bc/g;

/**
 * 静默执行pnpm命令
 * * 如果成功则不显示或返回任何东西
 * * 如果命令失败，则会输出stdout/err并reject
 */
export function execPnpmMute(cwd: string, args: string[] = []) {
	if (process.stderr.isTTY) {
		args.unshift('--color=always');
	}

	return execMute(cwd, ['pnpm', ...args]);
}

/**
 * 静默执行命令
 * * 如果成功则不显示或返回任何东西
 * * 如果命令失败，则会输出stdout/err并reject，然后退出当前进程
 */
export async function execMute(cwd: string, cmds: string[] = []) {
	try {
		logger.debug`执行命令: commandline<${cmds}>`;
		const r = await execa(cmds[0], cmds.slice(1), {
			stdio: ['ignore', 'pipe', 'pipe'],
			cwd,
			all: true,
			env,
		});
		if (logger.verbose.isEnabled) {
			logger.verbose(r.all.replace(colorReg, ''));
		}
		logger.debug`命令成功: commandline<${cmds}>`;
	} catch (e) {
		debugFailedCommand(e, cmds, cwd);
		logger.debug`进程即将退出`;
		shutdown(1);
	}
}

/**
 * 执行命令，不关心成功与否
 * 始终返回stdout字符串和exit code
 *
 * 如果出现无法启动程序的情况，会退出当前进程
 */
export async function execOutput(cwd: string, cmds: string[] = []) {
	try {
		logger.debug`执行命令: commandline<${cmds}> (cwd: long<${cwd}>)`;
		const r = await execa(cmds[0], cmds.slice(1), {
			stdio: ['inherit', 'pipe', 'pipe'],
			cwd,
			env,
			reject: false,
			verbose: 'full',
			encoding: 'utf8',
		});

		if (logger.verbose.isEnabled) {
			logger.verbose(r.stderr.replace(colorReg, ''));
		}

		let eCode = r.exitCode;
		if (eCode === undefined) {
			if (r.signal) {
				// 因信号退出
				eCode = 128 + (constants.signals[r.signal] ?? 0);
			} else if (r instanceof Error) {
				// 无法启动
				throw r;
			} else {
				// 未知异常
				console.error(`execa返回:`, r);
				throw new Error(`非预期的execa返回值`);
			}
		}

		logger.debug`命令返回(${eCode}): commandline<${cmds}>`;
		return {
			output: r.stdout,
			stderrText: r.stderr,
			status: eCode,
		};
	} catch (e) {
		debugFailedCommand(e, cmds, cwd);
		logger.debug`进程即将退出`;
		shutdown(1);
	}
}

function convertExecError(e: unknown) {
	if (e instanceof ExecaError) {
		const message = e.originalMessage || e.shortMessage;
		const ne = new Error(message, { cause: e });
		ne.name = e.name;
		ne.stack = e.stack.replace(e.message, message);
		return ne;
	} else {
		return convertCaughtError(e);
	}
}

function debugFailedCommand(e: unknown, cmds: string[], cwd: string, outputPrinted = false) {
	if (e instanceof ExecaError) {
		logger.error`运行命令失败:`;
		logger.error`  命令行: commandline<${cmds}>`;
		logger.error`  工作目录: long<${cwd}>`;

		const txt = (e.all || e.stderr || e.stdout || '').trim();
		if (txt) {
			const lines = txt.split('\n');
			const outputLog = logger.extend('std');
			for (const line of lines) {
				outputLog.warn(line);
			}
		} else if (outputPrinted) {
			logger.info`  输出已打印`;
		} else {
			logger.warn`  没有输出内容\nlong<${createStackTraceHolder('').stackOnly}>`;
		}
	} else {
		const err = convertExecError(e);
		logger.error`运行命令异常:`;
		logger.error`  命令行: commandline<${cmds}>`;
		logger.error`  工作目录: long<${cwd}>`;
		logger.error`  错误信息: long<${err.stack}>`;
	}
}
