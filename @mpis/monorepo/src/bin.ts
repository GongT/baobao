import { argv } from '@idlebox/args/default';
import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { debugMode, helpMode, printUsage, verboseMode } from './common/args.js';

registerNodejsExitHandler();

let level = EnableLogLevel.auto;
if (verboseMode) {
	level = EnableLogLevel.verbose;
} else if (debugMode) {
	level = EnableLogLevel.debug;
}
createRootLogger('', level);

if (helpMode) {
	printUsage();
	process.exit(0);
}

const start = Date.now();
registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${Date.now() - start}ms (${process.exitCode ? 'failed' : 'success'}).`;
	}),
);

const cmd = argv.command(['build', 'watch', 'clean']);
if (!cmd) {
	printUsage();
	logger.fatal`No command specified.`;
	process.exit(1);
}
export const currentCommand = cmd.value;

logger.log`Running command: ${cmd.value}`;

switch (cmd.value) {
	case 'build':
		await import('./commands/build.js');
		break;
	case 'watch':
		await import('./commands/watch.js');
		break;
	case 'clean':
		await import('./commands/clean.js');
		break;
}
