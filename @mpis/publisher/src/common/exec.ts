import { logger } from '@idlebox/cli';
import { convertCaughtError } from '@idlebox/common';
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
 * 无法确定或非0退出码的情况会抛出错误
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
		throw debugFailedCommand(e, ['pnpm', ...args], cwd);
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
 * * 如果命令失败，则会输出stdout/err并reject
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
		throw debugFailedCommand(e, cmds, cwd);
	}
}

/**
 * 执行命令，不关心成功与否
 * 始终返回stdout字符串和exit code
 *
 * 只在无法启动程序时会抛出错误，启动成功后命令失败，也不会输出错误信息
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
			// can not start or terminated by signal
			if (r.signal) {
				eCode = 128 + (constants.signals[r.signal] ?? 0);
			} else {
				throw debugFailedCommand(r, cmds, cwd);
			}
		}

		logger.debug`命令返回(${eCode}): commandline<${cmds}>`;
		return {
			output: r.stdout,
			stderrText: r.stderr,
			status: eCode,
		};
	} catch (e) {
		throw debugFailedCommand(e, cmds, cwd);
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

function debugFailedCommand(e: unknown, cmds: string[], cwd: string): Error {
	if (e instanceof ExecaError) {
		logger.error`运行命令失败:`;
		logger.error`  命令行: commandline<${cmds}>`;
		logger.error`  工作目录: long<${cwd}>`;
		const lines = (e.all || e.stderr || e.stdout || '').trim().split('\n');
		const outputLog = logger.extend('std');
		for (const line of lines) {
			outputLog.warn(line);
		}
		return e;
	} else {
		const err = convertExecError(e);
		logger.error`运行命令异常:`;
		logger.error`  命令行: commandline<${cmds}>`;
		logger.error`  工作目录: long<${cwd}>`;
		logger.error`  错误信息: long<${err.stack}>`;
		return err;
	}
}
