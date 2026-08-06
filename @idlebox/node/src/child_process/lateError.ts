import { execa, type Result } from 'execa';
import { printLine } from '../cli-io/output.js';
import { checkChildProcessResult } from './error.js';

interface IExecOptions {
	readonly cwd?: string;
	readonly env?: Record<string, string>;
	readonly verbose?: boolean;
}

/**
 * 运行命令，如果出错，则输出缓冲的stderr（如果stdout是inherit，也同时输出stdout）
 * 如果程序正常结束，则程序向stderr输出的内容直接丢弃（如果stdout是inherit，也同时丢弃）
 */
export async function execLazyError(cmd: string, args: string[], { cwd, env, verbose }: IExecOptions = {}) {
	if (verbose) {
		if (process.stderr.isTTY) {
			process.stderr.write(`\x1B[2m + ${cmd} ${args.join(' ')}\x1B[0m\n`);
		} else {
			process.stderr.write(` + ${cmd} ${args.join(' ')}\n`);
		}
	}

	const ret = await execa(cmd, args, {
		verbose: 'none',
		lines: false,
		stdio: ['ignore', 'pipe', 'pipe'],
		all: true,
		encoding: 'utf8',
		reject: false,
		cwd,
		env,
	});
	try {
		checkChildProcessResult(ret);
	} catch (e: any) {
		if (process.stderr.isTTY) {
			console.error('');
			printLine();
			console.error('\x1B[38;5;9m命令运行错误: %s', e.message);
			console.error('\x1B[2m$ "%s" %s\x1B[0m', cmd, args.map((v) => JSON.stringify(v)).join(' '));
			console.error('\x1B[2mcwd: %s\x1B[0m', cwd ?? process.cwd());
		}
		console.error('\x1B[2m<vvvvv 命令输出 vvvvv>\x1B[0m');
		console.error(outputToString(ret.all));
		console.error('\x1B[2m<^^^^^ 命令输出 ^^^^^>\x1B[0m');
		if (process.stderr.isTTY) {
			printLine();
		}
		Object.defineProperties(e, {
			stderr: { enumerable: false, value: ret.stderr },
			stdout: { enumerable: false, value: ret.stdout },
			all: { enumerable: false, value: ret.all },
		});
		throw e;
	}
	return ret;
}

function outputToString(output: Result['stderr']): string {
	if (!output) {
		return `\x1B[38;5;11m<缺少输出>\x1B[0m`;
	} else if (typeof output === 'string' || ArrayBuffer.isView(output)) {
		return output.toString().trim() || `\x1B[38;5;11m<输出为空>\x1B[0m`;
	} else if (Array.isArray(output)) {
		if (output.length === 0) {
			return `\x1B[38;5;11m<输出为空>\x1B[0m`;
		}
		return output.join('\n').trim();
	} else {
		return `\x1B[38;5;11m<无法识别的输出格式>\x1B[0m`;
	}
}
