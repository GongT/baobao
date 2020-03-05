import { logger } from '@gongt/vscode-helpers';
import { CollectingStream } from '@idlebox/node';
import { spawn } from 'child_process';
import * as split2 from 'split2';
import { PassThrough, Readable } from 'stream';

export async function spawnWait(cmd: string, args: string[], cwd?: string) {
	logger.log(' + %s %s', cmd, args.join(' '));

	/*if (cwd) {
		logger.log('> cwd: %s', cwd);
	}*/

	const p = spawn(cmd, args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		cwd: cwd || process.cwd(),
		env: {
			...process.env,
			LANG: 'C.UTF-8',
		},
	});

	const collect = collectOut(p.stdout);
	passError(p.stderr);

	await new Promise((resolve, reject) => {
		p.on('error', (e) => {
			reject(new Error(`Command "${cmd}" failed start with error "${e.message}"`));
		});
		p.on('exit', (code: number, signal: string) => {
			if (code === 0) return resolve();
			if (signal) return reject(new Error(`Command "${cmd}" quit with signal ${signal}`));
			return reject(new Error(`Command "${cmd}" quit with code ${code}`));
		});
	});

	return collect.getOutput().trim();
}

function collectOut(stream: Readable) {
	const s = stream.pipe(new PassThrough());
	s.pipe(split2()).on('data', (data) => {
		logger.log('|o|', data);
	});
	return new CollectingStream(s);
}

function passError(stream: Readable) {
	stream.pipe(split2()).on('data', (data) => {
		logger.error('|e|', data);
	});
}
