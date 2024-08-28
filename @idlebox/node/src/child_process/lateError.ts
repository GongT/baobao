import { execa, Options as ExecaOptions, Result } from 'execa';
import { printLine } from '../cli-io/output';
import { checkChildProcessResult } from './error';

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

type ConvStdout<T extends ISpawnOptions> = T extends { stdout: 'inherit' } ? Omit<T, 'stdout'> & { stdout: 'pipe' } : T;

export type ExecaReturnValue<options extends ISpawnOptions> = Result<
	ConvStdout<Omit<options, 'verbose'>> & ISpawnConst
>;

/**
 * 运行命令，如果出错，则输出缓冲的stderr（如果stdout是inherit，也同时输出stdout）
 * 如果程序正常结束，则程序向stderr输出的内容直接丢弃
 */
export async function execLazyError<T extends ISpawnOptions = ISpawnOptions>(
	cmd: string,
	args: string[],
	spawnOptions: T,
): Promise<ExecaReturnValue<T>> {
	let all = false;
	let { stdout, stdin, verbose, ...others } = spawnOptions;

	if (stdout === 'inherit') {
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
		...others,
		verbose: 'none',
		lines: false,
		stdio: undefined,
		stdin: stdin || 'ignore',
		stdout,
		stderr: 'pipe',
		all: all,
		encoding: 'utf8',
		reject: false,
	};
	const p = execa(cmd, args, opt);
	return p.then((ret) => {
		try {
			checkChildProcessResult(ret);
		} catch (e) {
			if (process.stderr.isTTY) {
				printLine();
				console.error('\x1B[2m + %s %s:\x1B[0m', cmd, args.join(' '));
			}
			console.error(ret.all || ret.stderr);
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
