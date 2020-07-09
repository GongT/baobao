import { spawn, SpawnOptions } from 'child_process';
import { TEMP_DIR } from './paths';
import { CollectingStream, streamPromise } from '@idlebox/node';
import * as split2 from 'split2';
import { mkdirpSync, createWriteStream } from 'fs-extra';
import { dirname } from 'path';

export interface IOptions extends SpawnOptions {
	cmd?: string;
	argv: string[];
	logFile?: string;
}

const verbose = process.argv.includes('--verbose');

export function execPromise({
	cmd = process.argv0,
	argv,
	logFile,
	cwd = TEMP_DIR,
	...opts
}: IOptions): Promise<{ result: string; full: string }> {
	const debugExec = ` + ${cmd} ${argv.join(' ')}`;
	if (verbose) console.error('\x1B[2m%s\x1B[0m', debugExec);
	const r = spawn(cmd, argv, {
		...opts,
		stdio: ['ignore', 'pipe', 'pipe'],
		shell: false,
		cwd: cwd,
	});

	const output = new CollectingStream();
	const full = new CollectingStream();

	full.write(debugExec + '\n\n');

	if (logFile) {
		mkdirpSync(dirname(logFile));
	}
	const logger = logFile ? createWriteStream(logFile) : null;
	r.stdout.pipe(split2()).on('data', (l) => {
		output.write(l + '\n');
		full.write(l + '\n');
		if (logger) logger.write(l + '\n');
	});
	r.stderr.pipe(split2()).on('data', (l) => {
		full.write(l + '\n');
		if (logger) logger.write(l + '\n');
	});
	Promise.all([streamPromise(r.stdout), streamPromise(r.stderr)]).finally(() => {
		output.end();
		full.end();
		if (logger) logger.end();
	});

	return new Promise((resolve, reject) => {
		r.on('error', (error) => {
			reject(error);
		});
		r.on('exit', (code, signal) => {
			if (verbose) console.error('\x1B[2m - %s finished with code %s, signal %s\x1B[0m', cmd, code, signal);
			if (signal) {
				console.error('\x1B[2m%s\x1B[0m', full.getOutput());
				reject(new Error('child process exit with signal ' + signal));
			} else if (code !== 0) {
				console.error('\x1B[2m%s\x1B[0m', full.getOutput());
				reject(new Error('child process exit with code ' + code));
			} else {
				Promise.all([output.promise(), full.promise()]).then(([output, full]) => {
					resolve({
						result: output.trim(),
						full: full,
					});
				}, reject);
			}
		});
	});
}
