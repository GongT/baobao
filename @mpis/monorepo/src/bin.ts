import { argv } from '@idlebox/args/default';
import { humanDate, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { debugMode, helpMode, printUsage, verboseMode } from './common/args.js';
import { runBuild } from './common/cmd.build.js';
import { runList } from './common/cmd.list.js';
import { runWatch } from './common/cmd.watch.js';

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
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode ? 'failed' : 'success'}).`;
	}),
);

const cmd = argv.command(['build', 'watch', 'clean', 'list', 'ls']);
if (!cmd) {
	printUsage();
	logger.fatal`No command specified.`;
	process.exit(1);
}
export const currentCommand = cmd.value;

logger.log`Running command: ${cmd.value}`;

process.title = `MpisMonorepo`;

switch (cmd.value) {
	case 'build':
		await runBuild();
		break;
	case 'watch':
		await runWatch();
		break;
	case 'list':
	case 'ls':
		await runList();
		break;
	case 'clean':
		throw new Error('The "clean" command is not implemented yet.');
}
