import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';

export function printUsage() {
	console.log('Usage: build-manager <command>');
	console.log();
	console.log('Commands:');
	console.log('  build   run build');
	console.log('  watch   start watch mode');
	console.log('  clean   cleanup all projects');
	console.log('  list/ls [--depth=0] list projects');
}

export const verboseMode = argv.flag(['-d', '--debug']) > 1;
export const debugMode = argv.flag(['-d', '--debug']) > 0;
export const helpMode = argv.flag(['-h', '--help']) > 0;

const cmd = argv.command(['build', 'watch', 'clean', 'list', 'ls']);
if (!cmd) {
	printUsage();
	logger.fatal`No command specified.`;
	process.exit(1);
}
export const currentCommand = cmd.value;
