import { argv } from '@idlebox/args/default';
import { Exit, prettyPrintError } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { debugMode, projectPath } from './common/constants.js';

registerNodejsExitHandler();

if (debugMode) {
	createRootLogger('publisher', debugMode === 1 ? EnableLogLevel.debug : EnableLogLevel.verbose);
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

try {
	if (cmd.value === 'pack') {
		await import('./commands/pack.js');
	} else if (cmd.value === 'publish') {
		await import('./commands/publish.js');
	} else {
		await import('./commands/extract.js');
	}
} catch (e: any) {
	if (e instanceof Exit) {
		throw e;
	} else {
		prettyPrintError('publisher执行命令失败', e);
		process.exitCode = process.exitCode || 1;
	}
}

function printUsage() {
	console.log('Usage: publisher <command>');
	console.log('  extract  创建tar包并解压');
	console.log('  pack     创建一个 tar 包');
	console.log('  publish  将项目发布到 npm');
}
