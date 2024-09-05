#!/usr/bin/env node

if (!process.execArgv.some((e) => e.startsWith('--inspect'))) {
	const { install } = await import('source-map-support');
	install();
}
const cmdList = {
	'detect-package-change': './lib/detect-package-change.js',
	'run-if-version-mismatch': './lib/run-if-version-mismatch.js',
};
const usage_prefix = `\x1B[1mnjspkg\x1B[0m \x1B[38;5;11m[common options]\x1B[0m`;

try {
	const { bootstrap } = await import('global-agent');
	bootstrap();

	const { configureProxy } = await import('./lib/inc/proxy.js');
	await configureProxy({
		environmentVariableNamespace: '',
		forceGlobalAgent: true,
		socketConnectionTimeout: 1000,
	});

	const { printCommonOptions } = await import('./lib/inc/getArg.js');

	let argv = process.argv.slice(2);
	const help = argv.includes('-h') || argv.includes('--help');
	argv = argv.filter((x) => x !== '-h' && x !== '--help');

	const cmd = argv[0];
	if (cmd && cmdList[cmd]) {
		const { main, helpString, usageString } = await import(cmdList[cmd]);
		if (help) {
			process.stderr.write(`Usage: ${usage_prefix} ${usageString().trim()}\n`);
			process.stderr.write(helpString().trim().replace(/^/gm, '  ') + '\n\n');
			printCommonOptions();
			process.stderr.write('\n');
			process.exit(0);
		} else {
			process.exitCode = await main(argv);
			process.exit(process.exitCode);
		}
	} else if (help) {
	} else if (cmd === undefined) {
		console.error('Command is required. pass -h / --help to get usage.');
		process.exit(1);
	} else {
		console.error('Unknown command: %s\n', cmd);
	}

	process.stderr.write(
		`\x1B[2mUsage:\x1B[0m\n    ${usage_prefix} \x1B[38;5;10m<command>\x1B[0m \x1B[38;5;14m[params]\x1B[0m \n\n`,
	);

	printCommonOptions();
	process.stderr.write('\n');

	for (const f of Object.values(cmdList)) {
		const { helpString, usageString } = await import(f);
		process.stderr.write(usageString().trim() + '\n');
		const s = helpString().trim();
		process.stderr.write(s.replace(/^/gm, '  ') + '\n\n');
	}

	process.exit(help ? 0 : 22);
} catch (e) {
	const { prettyPrintError } = await import('@idlebox/common');
	prettyPrintError('main', e);
	process.exit(1);
}
