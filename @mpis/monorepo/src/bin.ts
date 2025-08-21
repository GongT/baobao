import { humanDate, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { debuggerBreakUserEntrypoint, registerNodejsExitHandler, setExitCodeIfNot } from '@idlebox/node';
import { currentCommand, debugMode, helpMode, printUsage, verboseMode } from './common/args.js';

debuggerBreakUserEntrypoint();
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

logger.log`Running command: ${currentCommand}`;
logger.log`working directory: ${process.cwd()}`;

process.title = `MpisMonorepo`;

switch (currentCommand) {
	case 'build':
		{
			const { runBuild } = await import('./common/cmd.build.js');
			await runBuild();
			setExitCodeIfNot(0);
		}
		break;
	case 'watch':
		{
			const { runWatch } = await import('./common/cmd.watch.js');
			await runWatch();
			setExitCodeIfNot(0);
		}
		break;
	case 'list':
	case 'ls':
		{
			const { runList } = await import('./common/cmd.list.js');
			await runList();
			setExitCodeIfNot(0);
		}
		break;
	case 'clean':
		throw new Error('The "clean" command is not implemented yet.');
	default:
		throw new Error(`impossible: invalid command`);
}
