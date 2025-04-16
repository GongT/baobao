import { prettyPrintError } from '@idlebox/common';
import { bootstrap } from 'global-agent';
import { resolve } from 'path';
import cmdList from './commands/index.generated.js';
import { argv, isHelp, pCmd, printCommonOptions } from './inc/getArg.js';
import { registerSignal } from './inc/global-lifecycle.js';
import { configureProxy } from './inc/proxy.js';

const usage_prefix = `\x1B[1mnjspkg\x1B[0m \x1B[38;5;3m[通用参数]\x1B[0m`;

try {
	process.exitCode = await main();
	if (argv.flag('--verbose')) {
		console.log('exit code: %d', process.exitCode);
	}
	process.exit();
} catch (e: any) {
	prettyPrintError('main', e);
	process.exit(1);
}

async function main() {
	process.on('unhandledRejection', (reason, promise) => {
		debugger;
		console.error('got unhandledRejection: %s', reason);
		console.error(promise);
	});

	registerSignal();

	const chdir = argv.single(['--package']);
	if (chdir) process.chdir(resolve(process.cwd(), chdir));

	bootstrap({
		environmentVariableNamespace: '',
		forceGlobalAgent: true,
		socketConnectionTimeout: 1000,
	});

	await configureProxy();

	const subArgv = argv.command(Object.keys(cmdList));
	const cmd: keyof typeof cmdList = subArgv?.value as any;

	if (cmd && cmdList[cmd]) {
		const { main, helpString, usageString } = await import(cmdList[cmd]);
		if (isHelp) {
			process.stderr.write(`Usage: ${usage_prefix} ${pCmd(cmd)} ${usageString().trim()}\n`);
			process.stderr.write(helpString().trim().replace(/^/gm, '  ') + '\n\n');
			printCommonOptions();
			process.stderr.write('\n');
			return 0;
		} else {
			// RUN MAIN HERE
			return await main(subArgv);
		}
	} else if (isHelp) {
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
		process.stderr.write(pCmd(cmd) + ' ' + usageString().trim() + '\n');
		const s = helpString().trim();
		process.stderr.write(s.replace(/^/gm, '  ') + '\n\n');
	}

	return isHelp ? 0 : 22;
}
