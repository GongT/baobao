import { logger } from '@idlebox/logger';
import { execa, ExecaError } from 'execa';
import { projectPath } from './constants.js';

const env = {
	DEBUG_LEVEL: logger.verbose.isEnabled ? 'verbose' : logger.debug.isEnabled ? 'debug' : undefined,
};

export function execPnpm(args: string[] = []) {
	logger.debug`执行命令: pnpm commandline<${args}>`;
	return execa('pnpm', args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		all: true,
		encoding: 'utf8',
		cwd: projectPath,
		env,
	});
}

export function execPnpmUser(cwd: string, args: string[] = []) {
	logger.debug`执行命令: pnpm commandline<${args}>`;
	return execa('pnpm', args, {
		stdio: ['inherit', process.stderr, 'inherit'],
		cwd,
		buffer: false,
		env,
	});
}
const colorReg = /\x1B\[[0-9;]+?m|\x1Bc/g;

export async function execPnpmMute(cwd: string, args: string[] = []) {
	if (process.stderr.isTTY) {
		args.unshift('--color=always');
	}
	try {
		logger.debug`执行命令: pnpm commandline<${args}>`;
		const r = await execa('pnpm', args, {
			stdio: ['inherit', 'pipe', 'pipe'],
			cwd,
			all: true,
			env,
		});
		if (logger.verbose.isEnabled) {
			logger.verbose(r.all.replace(colorReg, ''));
		}
	} catch (e: any) {
		if (e instanceof ExecaError) {
			logger.error`failed execute command\n  command: long<${e.escapedCommand}>\n  working directory: long<${e.cwd}>`;
			console.error('');
			console.error((e.all || e.stdout || e.stderr || '').replace(/^/gm, `\x1B[48;5;11m \x1B[0m `));
			console.error('');

			const message = e.originalMessage || e.shortMessage;
			const ne = new Error(message);
			ne.name = e.name;
			ne.stack = e.stack.replace(e.message, message);
			throw ne;
		} else {
			throw e;
		}
	}
}
