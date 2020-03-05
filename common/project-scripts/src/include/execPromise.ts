import { spawn } from 'child_process';
import { TEMP_DIR } from './paths';
import { CollectingStream } from '@idlebox/node';

export function execPromise(
	cmd: string,
	argv: string[],
	cwd: string = TEMP_DIR
): Promise<{ out: string; err: string }> {
	console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
	const r = spawn(cmd, argv, {
		stdio: ['ignore', 'pipe', 'pipe'],
		shell: false,
		cwd: cwd,
	});

	const out = new CollectingStream(r.stdout);
	const err = new CollectingStream(r.stderr);

	return new Promise((resolve, reject) => {
		r.on('error', (error) => {
			reject(error);
		});
		r.on('exit', (code, signal) => {
			console.error('\x1B[2m - %s finished with code %s, signal %s\x1B[0m', cmd, code, signal);
			if (signal) reject(new Error('child process exit with code ' + code));
			else if (code !== 0) reject(new Error('child process exit with code ' + code));
			else
				resolve({
					out: out.getOutput(),
					err: err.getOutput(),
				});
		});
	});
}
