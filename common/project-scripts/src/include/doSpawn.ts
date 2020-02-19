import { spawn } from 'child_process';
import { sync as commandExists } from 'command-exists';
import { existsSync } from 'fs-extra';
import { platform, userInfo } from 'os';
import { resolve, basename } from 'path';
import { writeEnv } from './envPass';
import { TEMP_DIR } from './paths';

export const doSpawn: (file: string, args?: string[]) => void =
	platform() == 'linux' && commandExists('systemd-run') ? spawnSystemd : spawnNormal;

function getFile(file: string) {
	file = resolve(__dirname, '../actions/', file);
	if (!existsSync(file)) {
		throw new Error('Can not spawn file: ' + file);
	}
	return file;
}
function nodejsArguments(file: string, args: string[]) {
	return ['-r', 'source-map-support/register', file, ...args];
}

function spawnNormal(file: string, args: string[] = []) {
	file = getFile(file);
	console.log('Using spawn without systemd.');
	execv(process.argv0, nodejsArguments(file, args));
}

function spawnSystemd(file: string, args: string[] = []) {
	let isAlreadyQuit = false;
	file = getFile(file);

	console.log('Using systemd-run on linux.');
	const { uid } = userInfo();
	const unitName = `${basename(file, '.js')}.service`;

	const cmds = ['--quiet', '--wait', '--collect', '--pty', '--same-dir', `--unit=${unitName}`];
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

	writeEnv();
	cmds.push(`--setenv=LOAD_ENV_FILE=yes`);

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
