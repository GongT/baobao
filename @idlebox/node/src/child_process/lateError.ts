import { execa, Options as ExecaOptions, Result } from 'execa';
import { printLine } from '../cli-io/output.js';
import { checkChildProcessResult } from './error.js';

export type ISpawnOptions = Omit<
	ExecaOptions,
	'lines' | 'reject' | 'stdio' | 'encoding' | 'all' | 'stderr' | 'verbose'
> & {
	verbose?: boolean;
};
type ISpawnConst = {
	lines: false;
	reject: false;
	stderr: 'pipe';
	encoding: 'utf8';
};

type ConvStdout<T extends ISpawnOptions> = T['stdout'] extends 'inherit' ? Omit<T, 'stdout'> & { stdout: 'pipe' } : T;

export type ExecaReturnValue<options extends ISpawnOptions> = Result<
	ConvStdout<Omit<options, 'verbose'>> & ISpawnConst
>;

type NoStdio = Omit<ISpawnOptions, 'stdio'> & { stdio?: never };

/**
 * 运行命令，如果出错，则输出缓冲的stderr（如果stdout是inherit，也同时输出stdout）
 * 如果程序正常结束，则程序向stderr输出的内容直接丢弃（如果stdout是inherit，也同时丢弃）
 */
export function execLazyError<T extends NoStdio = NoStdio>(
	cmd: string,
	args: string[],
	spawnOptions: T
): Promise<ExecaReturnValue<T>> {
	let all = false;
	let { stdout, verbose, ...others } = spawnOptions;

	if (stdout === 'inherit' || stdout === undefined) {
		all = true;
		stdout = 'pipe';
	}

	if (verbose) {
		if (process.stderr.isTTY) {
			process.stderr.write(`\x1B[2m + ${cmd} ${args.join(' ')}\x1B[0m\n`);
		} else {
			process.stderr.write(` + ${cmd} ${args.join(' ')}\n`);
		}
	}

	const opt: ExecaOptions & ISpawnConst = {
		stdin: 'ignore',
		...others,
		verbose: 'none',
		lines: false,
		stdio: undefined,
		stdout,
		stderr: 'pipe',
		all: all,
		encoding: 'utf8',
		reject: false,
	};
	return execa(cmd, args, opt).then((ret) => {
		try {
			checkChildProcessResult(ret);
		} catch (e: any) {
			if (process.stderr.isTTY) {
				console.error('');
				printLine();
				console.error('\x1B[38;5;9mcommand failed execute: %s', e.message);
				console.error('\x1B[2m$ "%s" %s\x1B[0m', cmd, args.map((v) => JSON.stringify(v)).join(' '));
				console.error('\x1B[2mcwd: %s\x1B[0m', opt.cwd ?? process.cwd());
				console.error('\x1B[2m%s\x1B[0m', ret.all ? '[stdout+stderr]' : '[stderr]');
			}
			if (all && ret.all) {
				console.error('\x1B[2m[stdout+stderr]\x1B[0m');
				console.error(ret.all);
				console.error('\x1B[2m[stdout+stderr] END\x1B[0m');
			} else {
				console.error('\x1B[2m[stderr]\x1B[0m');
				console.error(ret.stderr);
				console.error('\x1B[2m[stderr] END\x1B[0m');
			}
			if (process.stderr.isTTY) {
				printLine();
			}
			throw e;
		}
		return ret as any;
	});
}

// // test:
// const x = await execLazyError('', [], { stdout: 'pipe' });
// x.stdout.replace('a', 'b');
