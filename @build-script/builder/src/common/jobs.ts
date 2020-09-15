import { resolve } from 'path';
import { PathEnvironment, streamPromise } from '@idlebox/node';
import { ExecFunc } from '../global';
import { fancyLog } from './fancyLog';
import { functionWithName } from './func';
import split2 from 'split2';

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
		(stdout ? console.log : console.error)(l);
	} else if (l.includes('\x1B')) {
		(stdout ? console.log : console.error)(l);
	} else {
		(stdout ? console.log : console.error)('%s%s%s', color, l, reset);
	}
}

export function createJobFunc(jobName: string, path: string, cmds: string | string[]): ExecFunc {
	let [command, ...args] = Array.isArray(cmds) ? cmds : cmds.split(/\s+/);
	if (!command) {
		return functionWithName(
			async () => {
				console.log('no script for %s, skip it.', jobName);
			},
			jobName,
			`${command} ${args.join(' ')}`
		);
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
	const callback = (cb: (error?: any) => void) => {
		const childEnv = { ...process.env };
		const pathHandler = new PathEnvironment('path', childEnv);
		pathHandler.add(resolve(path, 'node_modules/.bin'));
		pathHandler.add(resolve(__dirname, '../../node_modules/.bin'));
		pathHandler.save();

		fancyLog.info('%s%s%s:', green, jobName, reset);
		fancyLog.info(' + %s %s', command, args.join(' '));

		const ps = execa(command, args, {
			cwd: path,
			env: childEnv,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		const s1 = ps.stdout!.pipe(split2()).on('data', (l: string) => {
			colorIfNot(true, ignore, l);
		});
		const s2 = ps.stderr!.pipe(split2()).on('data', (l: string) => {
			colorIfNot(false, weakRed, l);
		});

		delete ps.stdout;
		delete ps.stderr;

		Promise.all([ps, streamPromise(s1), streamPromise(s2)]).then(
			() => {
				fancyLog.info('%s%s%s: success.', green, jobName, reset);
				cb();
			},
			(e: Error) => {
				fancyLog.error('%s%s%s: failed: %s.', red, jobName, reset, e.message);
				fancyLog.error('  > cwd: %s', path);
				cb(new Error(e?.message?.replace?.(/:/g, ':\n  ')));
			}
		);
	};

	return functionWithName(callback, jobName, `${command} ${args.join(' ')}`);
}
