import { CanceledError, createStackTraceHolder } from '@idlebox/common';
import { execa, ExecaError, type Result } from 'execa';
import { basename } from 'node:path';
import { printLine } from '../cli-io/output.js';

interface IExecOptions {
	readonly cwd?: string;
	readonly env?: Record<string, string>;
	readonly verbose?: boolean;
	readonly cancelSignal?: AbortSignal;
}

/**
 * 获取当前进程的标题
 * 1. process.title 如果不是 'node'
 * 2. process.argv[1] 的文件名部分
 * 3. '*unknown*'
 */
export function getProcessTitle(): string {
	if (process.title && process.title !== 'node') {
		return process.title;
	}
	if (process.argv[1]) {
		return basename(process.argv[1]);
	}
	return '*unknown*';
}

/**
 * 运行命令，如果出错，则输出缓冲的stderr（如果stdout是inherit，也同时输出stdout）
 * 如果程序正常结束，则程序向stderr输出的内容直接丢弃（如果stdout是inherit，也同时丢弃）
 *
 * @deprecated 似乎确实没什么用
 */
export async function execLazyError(cmd: string, args: string[], { cwd, env, verbose, cancelSignal }: IExecOptions = {}) {
	if (verbose) {
		if (process.stderr.isTTY) {
			process.stderr.write(`\x1B[2m + ${cmd} ${args.join(' ')}\x1B[0m\n`);
		} else {
			process.stderr.write(` + ${cmd} ${args.join(' ')}\n`);
		}
	}

	try {
		return await execa(cmd, args, {
			verbose: 'none',
			lines: false,
			stdio: ['ignore', 'pipe', 'pipe'],
			all: true,
			encoding: 'utf8',
			cwd,
			env,
			cancelSignal,
		});
	} catch (e: any) {
		if (process.stderr.isTTY) {
			console.error('');
			printLine();
		}
		const message = extractMessage(e);
		console.error('\x1B[38;5;9m[lazyErr][%s/%d] 命令运行错误: %s\x1B[0m', getProcessTitle(), process.pid, message);
		console.error('\x1B[2m[lazyErr] 命令行参数: "%s" %s\x1B[0m', cmd, args.map((v) => JSON.stringify(v)).join(' '));
		console.error('\x1B[2m[lazyErr] 工作目录: %s\x1B[0m', cwd ?? process.cwd());
		const ee = e.cause ?? e;
		if (ee instanceof ExecaError) {
			console.error('\x1B[2m[lazyErr] <vvvvv 命令输出 vvvvv>\x1B[0m');
			console.error(outputToString(ee.all));
			console.error('\x1B[2m[lazyErr] <^^^^^ 命令输出 ^^^^^>\x1B[0m');
			console.error('\x1B[2m[lazyErr] 以上问题来自:\n%s\x1B[0m', createStackTraceHolder('').stackOnly);
		} else if (ee instanceof CanceledError || ee.name === 'AbortError') {
			console.error('\x1B[2m[lazyErr] 命令被取消\x1B[0m');
		} else {
			console.error('\x1B[2m[lazyErr] 非ExecaError错误: %s\x1B[0m', ee.stack ?? ee.message ?? ee);
		}
		if (process.stderr.isTTY) {
			printLine();
		}
		throw e;
	}
}

function outputToString(output: Result['stderr']): string {
	if (!output) {
		return `\x1B[38;5;11m<缺少输出>\x1B[0m`;
	} else if (typeof output === 'string' || ArrayBuffer.isView(output)) {
		return dim(output.toString().trim().split('\n')) || `\x1B[38;5;11m<输出为空>\x1B[0m`;
	} else if (Array.isArray(output)) {
		if (output.length === 0) {
			return `\x1B[38;5;11m<输出为空>\x1B[0m`;
		}
		return dim(output as string[]);
	} else {
		return `\x1B[38;5;11m<无法识别的输出格式>\x1B[0m`;
	}
}

function dim(lines: string[]): string {
	let r = '';
	for (const line of lines) {
		if (line) {
			r += `\x1B[2m${line}\n`;
		} else {
			r += '\n';
		}
	}
	r = r.trim();
	r += '\x1B[0m';
	return r;
}

const nl = /[\n\r]+/g;
function extractMessage(e: any): string {
	if (e instanceof ExecaError) {
		return e.shortMessage.trim();
	} else if (e?.originalMessage) {
		return e.originalMessage.trim().replaceAll(nl, '\n');
	} else if (e?.message) {
		return e.message.trim().replaceAll(nl, '\n');
	}
	return String(e).replaceAll(nl, '\n');
}
