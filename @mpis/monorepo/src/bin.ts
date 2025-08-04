import { argv } from '@idlebox/args/default';
import { humanDate, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
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
		{
			const { runBuild } = await import('./common/cmd.build.js');
			await runBuild();
		}
		break;
	case 'watch':
		{
			const { runWatch } = await import('./common/cmd.watch.js');
			await runWatch();
		}
		break;
	case 'list':
	case 'ls':
		{
			const { runList } = await import('./common/cmd.list.js');
			await runList();
		}
		break;
	case 'clean':
		throw new Error('The "clean" command is not implemented yet.');
}
