import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { debugMode, projectPath } from './common/constants.js';

if (debugMode) {
	createRootLogger('publisher', EnableLogLevel.verbose);
} else {
	createRootLogger('publisher');
}

const allowedCommands = ['pack', 'publish', 'extract'];

try {
	argv.command(allowedCommands);
} catch (e: any) {
	throw logger.fatal('invalid arguments: %s', e.message);
}

const cmd = argv.command(allowedCommands);

if (!cmd) {
	printUsage();
	throw logger.fatal('没有提供命令.');
}

logger.log(`running "${cmd.value}" in project "${projectPath}"`);
process.env.npm_lifecycle_event = cmd.value;
process.env.lifecycle_event = cmd.value;

if (cmd.value === 'pack') {
	import('./commands/pack.js');
} else if (cmd.value === 'publish') {
	import('./commands/publish.js');
} else {
	import('./commands/extract.js');
}

function printUsage() {
	console.log('Usage: publisher <command>');
	console.log('  extract  创建tar包并解压');
	console.log('  pack     创建一个 tar 包');
	console.log('  publish  将项目发布到 npm');
}
