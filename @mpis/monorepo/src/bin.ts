import { argv } from '@idlebox/args/default';
import { humanDate, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler, setExitCodeIfNot, shutdown } from '@idlebox/node';
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
	shutdown(0);
}

const cmd = argv.command(['build', 'watch', 'clean', 'list', 'ls', 'dot', 'analyze']);
if (!cmd) {
	printUsage();
	logger.error`No command specified`;
	shutdown(1);
}
export const currentCommand = cmd.value;

const start = Date.now();
registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`Operation completed in ${humanDate.delta(Date.now() - start)} (${process.exitCode ? 'failed' : 'success'}).`;
	}),
);

logger.log`Running command: ${currentCommand}`;
logger.log`working directory: ${process.cwd()}`;

switch (currentCommand) {
	case 'build':
		{
			const { runBuild } = await import('./actions/cmd.build.js');
			await runBuild();
			setExitCodeIfNot(0);
		}
		break;
	case 'watch':
		{
			const { runWatch } = await import('./actions/cmd.watch.js');
			await runWatch();
			setExitCodeIfNot(0);
		}
		break;
	case 'list':
	case 'ls':
		{
			const { runList } = await import('./actions/cmd.list.js');
			await runList();
			setExitCodeIfNot(0);
		}
		break;
	case 'clean':
		throw new Error('The "clean" command is not implemented yet.');
	case 'dot':
		{
			const { runDot } = await import('./actions/cmd.dot.js');
			await runDot();
			setExitCodeIfNot(0);
		}
		break;
	case 'analyze':
		{
			const { runAnalyze } = await import('./actions/cmd.analyze.js');
			await runAnalyze(cmd);
			setExitCodeIfNot(0);
		}
		break;
	default:
		throw new Error(`impossible: invalid command`);
}
