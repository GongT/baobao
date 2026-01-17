import { logger } from '@idlebox/cli';
import { convertCaughtError } from '@idlebox/common';
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
		stdio: 'inherit',
		cwd,
		buffer: false,
		env,
	});
}
const colorReg = /\x1B\[[0-9;]+?m|\x1Bc/g;

export function execPnpmMute(cwd: string, args: string[] = []) {
	if (process.stderr.isTTY) {
		args.unshift('--color=always');
	}

	return execMute(cwd, ['pnpm', ...args]);
}

export async function execMute(cwd: string, cmds: string[] = []) {
	try {
		logger.debug`执行命令: commandline<${cmds}>`;
		const r = await execa(cmds[0], cmds.slice(1), {
			stdio: ['inherit', 'pipe', 'pipe'],
			cwd,
			all: true,
			env,
		});
		if (logger.verbose.isEnabled) {
			logger.verbose(r.all.replace(colorReg, ''));
		}
	} catch (e) {
		debugFailedCommand(e);
		throw convertCaughtError(e);
	}
}

export async function execOutput(cwd: string, cmds: string[] = []) {
	try {
		logger.debug`执行命令: commandline<${cmds}> (cwd: long<${cwd}>)`;
		const r = await execa(cmds[0], cmds.slice(1), {
			stdio: ['inherit', 'pipe', 'pipe'],
			cwd,
			env,
			reject: false,
			verbose: 'full',
		});

		if (logger.verbose.isEnabled) {
			logger.verbose(r.stderr.replace(colorReg, ''));
		}

		return {
			output: r.stdout,
			status: r.exitCode,
		};
	} catch (e) {
		debugFailedCommand(e);
		throw convertCaughtError(e);
	}
}

export function convertExecError(err: unknown) {
	const e = convertCaughtError(err);
	if (e instanceof ExecaError) {
		const message = e.originalMessage || e.shortMessage;
		const ne = new Error(message, { cause: e });
		ne.name = e.name;
		ne.stack = e.stack.replace(e.message, message);
		return ne;
	} else {
		return e;
	}
}

export function debugFailedCommand(e: unknown) {
	if (e instanceof ExecaError) {
		logger.error`failed execute command\n  command: long<${e.escapedCommand}>\n  working directory: long<${e.cwd}>`;
		console.error('');
		console.error((e.all || e.stdout || e.stderr || '').replace(/^/gm, `\x1B[48;5;11m \x1B[0m `));
		console.error('');
	}
}
