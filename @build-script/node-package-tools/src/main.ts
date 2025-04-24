import { prettyPrintError } from '@idlebox/common';
import { resolve } from 'node:path';
import cmdList from './command-file-map.generated.js';
import { argv, DieError, isHelp, pCmd, printCommonOptions } from './common/functions/cli.js';
import { registerShutdownHandlers, shutdown } from './common/functions/global-lifecycle.js';
import { configureProxyFromEnvironment } from './common/package-manager/proxy.js';

const usage_prefix = '\x1B[1mnjspkg\x1B[0m \x1B[38;5;3m[通用参数]\x1B[0m';

try {
	process.exitCode = await main();
	if (argv.flag('--verbose')) {
		console.log('exit code: %d', process.exitCode);
	}
	process.exit();
} catch (e: any) {
	if (e instanceof DieError) {
		console.error('错误: %s', e.message);
	} else {
		prettyPrintError('main', e);
	}

	shutdown(1);
}

async function main() {
	const chdir = argv.single(['--package']);
	if (chdir) process.chdir(resolve(process.cwd(), chdir));

	const subArgv = argv.command(Object.keys(cmdList));
	const cmd: keyof typeof cmdList = subArgv?.value as any;

	if (cmd && cmdList[cmd]) {
		const { main, helpString, usageString } = await import(cmdList[cmd]);
		if (isHelp) {
			process.stderr.write(`Usage: ${usage_prefix} ${pCmd(cmd)} ${usageString().trim()}\n`);
			process.stderr.write(`${helpString().trim().replace(/^/gm, '  ')}\n\n`);
			printCommonOptions();
			process.stderr.write('\n');
			return 0;
		}

		registerShutdownHandlers();
		configureProxyFromEnvironment();

		// RUN MAIN HERE
		return await main(subArgv);
	}
	if (isHelp) {
	} else if (cmd === undefined) {
		console.error('Command is required. pass -h / --help to get usage.');
		return 1;
	} else {
		console.error('Unknown command: %s\n', cmd);
	}

	process.stderr.write(
		`\x1B[2mUsage:\x1B[0m\n    ${usage_prefix} \x1B[38;5;10m<命令>\x1B[0m \x1B[38;5;14m[命令参数]\x1B[0m \n\n`
	);

	printCommonOptions();
	process.stderr.write('\n');

	for (const [cmd, file] of Object.entries(cmdList)) {
		const { helpString, usageString } = await import(file);
		process.stderr.write(`${pCmd(cmd)} ${usageString().trim()}\n`);
		const s = helpString().trim();
		process.stderr.write(`${s.replace(/^/gm, '  ')}\n\n`);
	}

	return isHelp ? 0 : 22;
}
