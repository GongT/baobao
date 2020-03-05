import { spawn } from 'child_process';
import { TEMP_DIR } from './paths';
import { CollectingStream } from '@idlebox/node';
import * as split2 from 'split2';

export function execPromise(
	cmd: string,
	argv: string[],
	cwd: string = TEMP_DIR
): Promise<{ result: string; full: string }> {
	console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
	const r = spawn(cmd, argv, {
		stdio: ['ignore', 'pipe', 'pipe'],
		shell: false,
		cwd: cwd,
	});

	const output = new CollectingStream();
	const full = new CollectingStream();
	r.stdout.pipe(split2()).on('data', (l) => {
		output.write(l + '\n');
		full.write(l + '\n');
	});
	r.stderr.pipe(split2()).on('data', (l) => {
		full.write(l + '\n');
	});

	return new Promise((resolve, reject) => {
		r.on('error', (error) => {
			reject(error);
		});
		r.on('exit', (code, signal) => {
			console.error('\x1B[2m - %s finished with code %s, signal %s\x1B[0m', cmd, code, signal);
			if (signal) {
				console.error('\x1B[2m%s\x1B[0m', full.getOutput());
				reject(new Error('child process exit with signal ' + signal));
			} else if (code !== 0) {
				console.error('\x1B[2m%s\x1B[0m', full.getOutput());
				reject(new Error('child process exit with code ' + code));
			} else {
				resolve({
					result: output.getOutput().trim(),
					full: full.getOutput(),
				});
			}
		});
	});
}
