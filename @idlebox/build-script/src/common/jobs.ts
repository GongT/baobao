import { PlatformPathArray } from '@idlebox/platform';
import { resolve } from 'path';
import { ExecFunc } from '../global';
import { fancyLog } from './fancyLog';
import { functionWithName } from './func';
import split2 = require('split2');

const execa = require('execa');

let ignore: string = '';
let weakRed: string = '';
let green: string = '';
let red: string = '';
let reset: string = '';
const colorEnabled = !!process.stdout.isTTY;
if (colorEnabled) {
	ignore = '\x1B[2m';
	weakRed = '\x1B[38;5;1;2m';
	green = '\x1B[38;5;2m';
	red = '\x1B[38;5;1m';
	reset = '\x1B[0m';
}

export function createOtherJobFunc(jobName: string, path: string): ExecFunc {
	return createJobFunc(jobName, path, [process.argv[0], process.argv[1], jobName]);
}

function colorIfNot(stdout: boolean, color: string, l: string) {
	if (!colorEnabled) {
		(stdout ? console.log : console.error)(l.trim());
	} else if (l.includes('\x1B')) {
		(stdout ? console.log : console.error)(l.trim());
	} else {
		(stdout ? console.log : console.error)('%s%s%s', color, l.trim(), reset);
	}
}

export function createJobFunc(jobName: string, path: string, cmds: string | string[]): ExecFunc {
	let [command, ...args] = Array.isArray(cmds) ? cmds : cmds.split(/\s+/);
	if (!command) {
		throw new Error(`job ${jobName} has no command line`);
	}

	if (command.endsWith('.js')) {
		args.unshift(command);
		command = process.argv0;
	} else if (command.endsWith('.ts')) {
		args.unshift('--transpile-only');
		args.unshift(command);
		command = 'ts-node';
	} else if (command.endsWith('.mjs')) {
		args.unshift('--experimental-modules');
		args.unshift(command);
		command = process.argv0;
	} else if (command === 'node') {
		command = process.argv0;
	}
	fancyLog.debug('define: %s%s%s: %s %s', green, jobName, reset, command, args.join(' '));
	const callback = async () => {
		const childEnv = { ...process.env };
		const pathHandler = new PlatformPathArray('path', childEnv);
		pathHandler.prepend(resolve(path, 'node_modules/.bin'));
		pathHandler.prepend(resolve(__dirname, '../../node_modules/.bin'));
		pathHandler.save();

		fancyLog.info('%s%s%s: %s %s', green, jobName, reset, command, args.join(' '));
		const ps = execa(command, args, {
			cwd: path,
			env: childEnv,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		ps
			.stdout!.pipe(split2())
			.on('data', (l: string) => {
				colorIfNot(true, ignore, l);
			})
			.resume();
		ps
			.stderr!.pipe(split2())
			.on('data', (l: string) => {
				colorIfNot(false, weakRed, l);
			})
			.resume();

		await ps.then(
			() => {
				fancyLog.info('%s%s%s: success.', green, jobName, reset);
			},
			(e: Error) => {
				fancyLog.error('%s%s%s: failed: %s.', red, jobName, reset, e.message);
				throw e;
			}
		);
	};

	return functionWithName(callback, jobName, `${command} ${args.join(' ')}`);
}
