import { argv } from '@idlebox/args/default';
import { UsageError } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';

let debugMode: boolean;
let verboseMode: boolean;

export function printUsage() {
	console.log('Usage: my-cli <command>');
	console.log();
	console.log('Commands:');
	console.log('  build   run build [--dump]');
	console.log('  watch   start watch mode [--dump]');
	console.log('  clean   cleanup the project');
	// console.log('     init create config file if not');
}

export function initializeLogger() {
	const debugLevel = argv.flag(['-d', '--debug']);

	debugMode = debugLevel > 0;
	verboseMode = debugLevel > 1;

	let level = EnableLogLevel.auto;
	if (verboseMode) {
		level = EnableLogLevel.verbose;
	} else if (debugMode) {
		level = EnableLogLevel.debug;
	}

	createRootLogger('mpis:run', level);
}

function parseCliArgs() {
	const command = argv.command(['build', 'watch', 'clean', 'config']);
	if (!command) {
		printUsage();
		throw new UsageError(`No command provided. Please specify a command to run.`);
	}

	const watchMode = command.value === 'watch';
	const buildMode = command.value === 'build';

	let dumpConfig = false;

	let breakMode = false;
	if (watchMode) {
		dumpConfig = argv.flag(['--dump']) > 0;
		breakMode = argv.flag(['--break']) > 0;
	}

	let withCleanup = false;
	if (buildMode) {
		dumpConfig = argv.flag(['--dump']) > 0;
		withCleanup = argv.flag(['--clean']) > 0;
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

	if (argv.unused().length) {
		printUsage();
		console.error('');
		throw logger.fatal`Unknown arguments: ${argv.unused().join(' ')}`;
	}
	return r;
}

let _context: Readonly<ReturnType<typeof parseCliArgs>>;

export function context() {
	if (!_context) {
		_context = parseCliArgs();
	}
	return _context;
}
