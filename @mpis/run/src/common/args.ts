import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';

export function printUsage() {
	console.log('Usage: my-cli <command>');
	console.log();
	console.log('Commands:');
	console.log('  build   run build [--dump]');
	console.log('  watch   start watch mode [--dump]');
	console.log('  clean   cleanup the project');
	// console.log('     init create config file if not');
}

export function parseCliArgs() {
	const debugLevel = argv.flag(['-d', '--debug']);

	const debugMode = debugLevel > 0;
	const verboseMode = debugLevel > 1;

	let level = EnableLogLevel.log;
	if (verboseMode) {
		level = EnableLogLevel.verbose;
	} else if (debugMode) {
		level = EnableLogLevel.debug;
	}

	createRootLogger('', level);

	const command = argv.command(['build', 'watch', 'clean', 'config']);
	if (!command) {
		printUsage();
		throw logger.fatal`No command provided. Please specify a command to run.`;
	}

	const watchMode = command.value === 'watch';
	const buildMode = command.value === 'build';

	let dumpConfig = false;

	let breakMode = false;
	if (watchMode) {
		dumpConfig = argv.flag('--dump') > 0;
		breakMode = argv.flag('--break') > 0;
	}

	let withCleanup = false;
	if (buildMode) {
		dumpConfig = argv.flag('--dump') > 0;
		withCleanup = argv.flag('--clean') > 0;
	}

	let configCommand;
	if (command.value === 'config') {
		const cfg = command.command(['dump']);
		if (!cfg) {
			printUsage();
			throw logger.fatal`No sub command for "config"`;
		}

		configCommand = cfg.value;
		// will do dump
	} else {
		configCommand = undefined;
	}

	const r = {
		command: command.value,
		configCommand,
		debugMode,
		verboseMode,
		watchMode,
		buildMode,
		breakMode,
		withCleanup,
		dumpConfig,
	};

	context = r;

	if (argv.unused().length) {
		printUsage();
		console.error('');
		throw logger.fatal`Unknown arguments: ${argv.unused().join(' ')}`;
	}
	return r;
}

export let context: Readonly<ReturnType<typeof parseCliArgs>>;
