import { spawn } from 'child_process';
import { commandInPath } from '@idlebox/node';
import { existsSync, lstatSync, readlinkSync } from 'fs-extra';
import { platform, userInfo } from 'os';
import { resolve, basename } from 'path';
import { TEMP_DIR } from './paths';

export const doSpawn: (file: string, args?: string[]) => void =
	platform() == 'linux' &&
	commandInPath('systemd-run') &&
	process.env.INIT_PROCESS === 'systemd' &&
	!process.env.DISABLE_SYSTEMD
		? spawnSystemd
		: spawnNormal;

function getFile(file: string) {
	file = resolve(__dirname, '../actions/', file);
	if (!existsSync(file)) {
		throw new Error('Can not spawn file: ' + file);
	}
	return file;
}
function nodejsArguments(file: string, args: string[]) {
	return ['--unhandled-rejections=strict', '-r', require.resolve('source-map-support/register'), file, ...args];
}

function spawnNormal(file: string, args: string[] = []) {
	file = getFile(file);
	console.log('Using spawn without systemd.');
	execv(process.argv0, nodejsArguments(file, args));
}

function spawnSystemd(file: string, args: string[] = []) {
	if (!lstatSync('/proc/1/exe').isSymbolicLink() || !readlinkSync('/proc/1/exe').endsWith('/systemd')) {
		return spawnNormal(file, args);
	}

	let isAlreadyQuit = false;
	file = getFile(file);

	console.log('Using systemd-run on linux.');
	const { uid } = userInfo();
	const unitName = `${basename(file, '.js')}.scope`;

	const cmds = ['--quiet', '--scope', '--collect', '--same-dir', `--unit=${unitName}`];
	if (uid > 0) {
		cmds.push('--user');
	}

	function handleSystemQuit(e: NodeJS.Signals | number) {
		console.error('handle exit...', e);
		const stop = [];
		if (uid > 0) {
			stop.push('--user');
		}
		stop.push(isAlreadyQuit ? 'kill' : 'stop', unitName);
		isAlreadyQuit = true;
		spawnQuit('systemctl', stop);
	}

	cmds.push(process.argv0, ...nodejsArguments(file, args));

	process.on('SIGINT', handleSystemQuit);
	process.on('beforeExit', handleSystemQuit);

	execv('systemd-run', cmds);
}

function execv(cmd: string, argv: string[]) {
	console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
	const r = spawn(cmd, argv, {
		stdio: 'inherit',
		shell: false,
		cwd: TEMP_DIR,
	});
	r.on('error', (error) => {
		console.error('\x1B[35;5;9m - %s can not start, %s\x1B[0m', cmd, error.message);
		setImmediate(() => {
			throw error;
		});
	});
	r.on('exit', (code, signal) => {
		console.error('\x1B[2m - %s finished with code %s, signal %s\x1B[0m', cmd, code, signal);
		if (code !== 0) process.exit(code);
		if (signal) process.kill(process.pid, signal);
		process.exit(0);
	});
}
function spawnQuit(cmd: string, argv: string[]) {
	console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
	const r = spawn(cmd, argv, {
		stdio: 'inherit',
		shell: false,
		cwd: TEMP_DIR,
	});
	r.on('error', (error) => {
		console.error('\x1B[35;5;9m - can not stop, %s\x1B[0m', error.message);
	});
	r.on('exit', (code, signal) => {
		console.error('\x1B[2m - stop: code %s, signal %s\x1B[0m', cmd, code, signal);
	});
}