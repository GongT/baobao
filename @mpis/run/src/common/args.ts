import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';

export function printUsage() {
	console.log('Usage: my-cli <command>');
	console.log();
	console.log('Commands:');
	console.log('  build   run build');
	console.log('  watch   start watch mode');
	console.log('  clean   cleanup the project');
	console.log('  init    create config/commands.json');
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

	const command = argv.command(['build', 'watch', 'clean', 'init']);
	if (!command) {
		printUsage();
		throw logger.fatal`No command provided. Please specify a command to run.`;
	}

	const watchMode = command.value === 'watch';
	const buildMode = command.value === 'build';

	let breakMode = false;
	if (watchMode) {
		breakMode = argv.flag('--break') > 0;
	}

	let withCleanup = false;
	if (buildMode) {
		withCleanup = argv.flag('--clean') > 0;
	}

	if (argv.unused().length > 0) {
		throw logger.fatal`Unknown arguments: ${argv.unused().join(' ')}`;
	}

	const r = {
		command: command.value,
		debugMode,
		verboseMode,
		watchMode,
		buildMode,
		breakMode,
		withCleanup,
	};

	context = r;

	return r;
}

export let context: Readonly<ReturnType<typeof parseCliArgs>>;
