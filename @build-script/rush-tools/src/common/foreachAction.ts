import { resolve } from 'path';
import { PassThrough } from 'stream';
import { sleep } from '@idlebox/common';
import { streamPromise } from '@idlebox/node';
import { execa } from 'execa';
import { createWriteStream, ensureDirSync } from 'fs-extra';
import { ICProjectConfig, RushProject } from '../api';
import { shiftArgumentFlag } from './arguments';

interface IRunArgs {
	quiet: boolean;
	errcontinue: boolean;
	argv: readonly string[];
}

export function parseForeachCommand(argv: string[], extraFlags: string[] = []): IRunArgs {
	const quiet = shiftArgumentFlag(argv, 'quiet');
	const errcontinue = shiftArgumentFlag(argv, 'continue');

	if (argv.length === 0) {
		throw new Error('Must specific some command or js file to run');
	}

	if (argv[0] === '--help' || argv[0] === '-h') {
		console.error(
			'Usage: $0 foreach [--quiet] [--continue]%s <command>',
			extraFlags.map((e) => ` [--${e}]`).join('')
		);
		console.error('                  -c "bash script"');
		console.error('                  -C "powershell script"');
		console.error('                  script.js ...args');
		console.error('                  script.ts ...args');
		process.exit(0);
	}

	if (argv[0] === '-c') {
		argv.unshift('bash');
	} else if (argv[0].endsWith('.js') || argv[0].endsWith('.cjs') || argv[0].endsWith('.mjs')) {
		argv[0] = resolve(process.cwd(), argv[0]);
		argv.unshift('node');
	} else if (argv[0].endsWith('.ts')) {
		argv[0] = resolve(process.cwd(), argv[0]);
		argv.unshift('ts-node');
	}

	return { quiet, errcontinue, argv };
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

	const stdout = p.stdout!.pipe(new PassThrough(), { end: true });
	const stderr = p.stderr!.pipe(new PassThrough(), { end: true });
	stdout.pipe(process.stdout);
	stderr.pipe(process.stderr);

	const logPath = resolve(absPath, 'rush-logs');
	ensureDirSync(logPath);
	const logger = createWriteStream(logPath + '/rush-tools.run.log');
	stdout.pipe(logger, { end: false });
	stderr.pipe(logger, { end: false });

	try {
		await p;
	} catch (e: any) {
		if (options.errcontinue) {
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
