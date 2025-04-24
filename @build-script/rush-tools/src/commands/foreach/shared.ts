import { ArgumentError, type IArgsReaderApi } from '@idlebox/args';
import { resolve } from 'node:path';

export const execUsage = '[--options] [--] <command>';
export const execHelp = `
	--quiet: no output
	--continue: when command error, ignore and continue to next project

Supported Commandline:
	-c "bash script" ...args
	-File/-f "powershell script"
	script.js ...args
	script.ts ...args (note: use ts-node)
	script.py ...args (note: use python3)
`.trim();
export function execCommonArg(sub: IArgsReaderApi) {
	const quiet = sub.flag('--quiet') > 0;
	const onErrorContinue = sub.flag('--continue') > 0;

	const argv = sub.range(0);
	if (argv.length === 0) {
		throw new Error('Must specific some command or script file to run');
	}

	if (argv[0] === '-c') {
		argv.unshift('bash');
	} else if (argv[0].endsWith('.js') || argv[0].endsWith('.cjs') || argv[0].endsWith('.mjs')) {
		argv[0] = resolve(process.cwd(), argv[0]);
		argv.unshift(process.execPath, ...process.execArgv);
	} else if (argv[0].endsWith('.ts')) {
		argv[0] = resolve(process.cwd(), argv[0]);
		argv.unshift('ts-node');
	} else if (argv[0].endsWith('.py')) {
		argv[0] = resolve(process.cwd(), argv[0]);
		argv.unshift('python3');
	} else {
		throw new ArgumentError(`unknow how to execute this command: ${argv[0]}`);
	}

	return { quiet, onErrorContinue, argv };
}
