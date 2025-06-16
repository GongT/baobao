import { argv } from '@idlebox/args/default';
import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { printUsage } from './common/args.js';

registerNodejsExitHandler();

let level = EnableLogLevel.auto;
if (argv.flag(['-v', '--verbose']) > 0) {
	level = EnableLogLevel.verbose;
} else if (argv.flag(['-d', '--debug']) > 0) {
	level = EnableLogLevel.debug;
}
createRootLogger('', level);

if (argv.flag(['-h', '--help']) > 0) {
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
