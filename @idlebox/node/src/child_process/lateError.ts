import { execa, ExecaReturnValue, Options as ExecaOptions } from 'execa';
import { printLine } from '../cli-io/output';
import { checkChildProcessResult } from './error';

export interface ISpawnAdditionOptions {
	verbose?: boolean;
}

export async function execLazyError(
	cmd: string,
	args: string[],
	spawnOptions: Omit<ExecaOptions, 'reject' | 'stdio' | 'encoding' | 'all' | 'stderr'> & ISpawnAdditionOptions = {}
): Promise<ExecaReturnValue<string>> {
	let all = false;
	let { stdout, stdin, verbose, ...options } = spawnOptions;

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

	const p = execa(cmd, args, {
		...options,
		stdio: [stdin || 'ignore', stdout, 'pipe'],
		all: all,
		encoding: 'utf8',
		reject: false,
	});
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
		return ret;
	});
}
