#!/usr/bin/env node

process.env.GLOBAL_AGENT_FORCE_GLOBAL_AGENT = '1';

require('source-map-support/register');

const cmdList = {
	'detect-package-change': '../lib/detect-package-change.js',
	'run-if-version-mismatch': '../lib/run-if-version-mismatch.js',
};
const usage_prefix = `\x1B[1mnjspkg\x1B[0m \x1B[38;5;11m[common options]\x1B[0m`;

(async () => {
	require('global-agent/bootstrap');
	const { configureProxy } = require('../lib/inc/proxy.js');
	await configureProxy();

	const { printCommonOptions } = require('../lib/inc/getArg.js');

	let argv = process.argv.slice(2);
	const help = argv.includes('-h') || argv.includes('--help');
	argv = argv.filter((x) => x !== '-h' && x !== '--help');

	const cmd = argv[0];
	if (cmd && cmdList[cmd]) {
		const { main, helpString, usageString } = require(cmdList[cmd]);
		if (help) {
			process.stderr.write(`Usage: ${usage_prefix} ${usageString().trim()}\n`);
			process.stderr.write(helpString().trim().replace(/^/gm, '  ') + '\n\n');
			printCommonOptions();
			process.stderr.write('\n');
			return;
		}
		return main(argv);
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
		const { helpString, usageString } = require(f);
		process.stderr.write(usageString().trim() + '\n');
		const s = helpString().trim();
		process.stderr.write(s.replace(/^/gm, '  ') + '\n\n');
	}

	process.exit(help ? 0 : 22);
})().then(
	(ret) => {
		process.exit(ret);
	},
	(e) => {
		const { prettyPrintError } = require('@idlebox/common');
		prettyPrintError('main', e);
		process.exit(1);
	},
);
