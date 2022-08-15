import split2 from 'split2';
import { execa, Options as SpawnOptions } from 'execa';
import { dirname } from 'path';
import { CollectingStream, streamPromise } from '@idlebox/node';
import { createFileSync, createWriteStream, mkdirpSync, truncateSync } from 'fs-extra';
import { TEMP_DIR } from './paths';

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
	const debugExec = ` + ${cmd} ${argv.join(' ')} (wd: ${cwd})`;
	if (verbose) console.error('\x1B[2m%s\x1B[0m', debugExec);
	const r = execa(cmd, argv, {
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
		createFileSync(logFile);
		truncateSync(logFile);
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
				const l = '==========================================';
				console.error(`${l}\n\x1B[0m%s\n${l}`, full.getOutput());
				reject(new Error('child process exit with signal ' + signal));
			} else if (code !== 0) {
				const l = '==========================================';
				console.error(`${l}\n\x1B[0m%s\n${l}`, full.getOutput());
				reject(new Error('child process exit with code ' + code));
			} else {
				Promise.all([output.promise(), full.promise(), logger ? streamPromise(logger) : null]).then(
					([output, full]) => {
						resolve({
							result: output.trim(),
							full: full,
						});
					},
					reject
				);
			}
		});
	});
}
