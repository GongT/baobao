import { sleep } from '@idlebox/common';
import { streamPromise } from '@idlebox/node';
import { execa } from 'execa';
import { createWriteStream, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import type { ICProjectConfig, RushProject } from '../api.js';

interface IRunArgs {
	quiet: boolean;
	onErrorContinue: boolean;
	argv: readonly string[];
}

export async function runCustomCommand(rush: RushProject, project: string | ICProjectConfig, options: IRunArgs) {
	project = rush.getProject(project);
	const absPath = rush.absolute(project);
	process.env.PROJECT_PATH = absPath;
	process.env.PROJECT_NAME = project.packageName;

	if (!options.quiet) {
		console.error('[rush-tool] +++ %s', options.argv.join(' '));
		console.error(
			'[rush-tool] export PROJECT_NAME=%s PROJECT_PATH=%s',
			process.env.PROJECT_NAME,
			process.env.PROJECT_PATH
		);
	}
	const p = execa(options.argv[0], options.argv.slice(1), {
		cwd: absPath,
		// env.path
		stdio: ['inherit', 'pipe', 'pipe'],
	});

	const stdout = p.stdout?.pipe(new PassThrough(), { end: true });
	const stderr = p.stderr?.pipe(new PassThrough(), { end: true });
	stdout.pipe(process.stdout);
	stderr.pipe(process.stderr);

	const logPath = resolve(absPath, '.rush/logs');
	mkdirSync(logPath, { recursive: true });
	const logger = createWriteStream(`${logPath}/rush-tools.run.log`);
	stdout.pipe(logger, { end: false });
	stderr.pipe(logger, { end: false });

	try {
		await p;
	} catch (e: any) {
		if (options.onErrorContinue) {
			if (options.quiet) {
				console.error('[rush-tool] +++ %s', options.argv.join(' '));
				console.error(
					'[rush-tool] export PROJECT_NAME=%s PROJECT_PATH=%s',
					process.env.PROJECT_NAME,
					process.env.PROJECT_PATH
				);
			}
			console.error('[rush-tool] [command fail]', e.message);
		} else {
			throw e;
		}
	}

	await streamPromise(stdout);
	await streamPromise(stderr);
	process.stdout.write('');
	process.stderr.write('');
	await sleep(10);

	if (!options.quiet) {
		console.error('[rush-tool] [command complete] code=%s, signal=%s', p.exitCode, p.signalCode);
	}

	logger.close();
}
