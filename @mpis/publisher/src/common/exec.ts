import { execa } from 'execa';
import { projectPath } from './constants.js';

export function execPnpm(args: string[] = []) {
	return execa('pnpm', args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		all: true,
		encoding: 'utf8',
		cwd: projectPath,
	});
}

export function execPnpmUser(cwd: string, args: string[] = []) {
	return execa('pnpm', args, {
		stdio: ['inherit', process.stderr, 'inherit'],
		cwd,
		buffer: false,
	});
}

export function execPnpmMute(cwd: string, args: string[] = []) {
	return execa('pnpm', args, {
		stdio: ['inherit', 'ignore', 'inherit'],
		cwd,
		buffer: false,
	});
}
