import execa from 'execa';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { createWriteStream } from 'fs-extra';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

/** @internal */
export default async function runForEach(argv: string[]) {
	let quiet = false;
	if (argv[0] === '--quiet') {
		quiet = true;
		argv.shift();
	}
	if (argv.length === 0) {
		throw new Error('Must specific some command or js file to run');
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

	const rush = new RushProject();
	for (const { projectFolder, packageName } of rush.projects) {
		const absPath = rush.absolute(projectFolder);
		process.env.PROJECT_PATH = absPath;
		process.env.PROJECT_NAME = packageName;

		if (!quiet) {
			console.error('[rush-tool] +++ %s', argv.join(' '));
			console.error('[rush-tool] > %s', absPath);
		}
		const p = execa(argv[0], argv.slice(1), {
			cwd: absPath,
			// env.path
			stdio: ['inherit', 'pipe', 'pipe'],
		});

		const stdout = p.stdout!.pipe(new PassThrough());
		const stderr = p.stderr!.pipe(new PassThrough());
		stdout.pipe(process.stdout);
		stderr.pipe(process.stderr);

		const logger = createWriteStream(resolve(absPath, 'run.rush-tool.log'));
		stdout.pipe(logger, { end: false });
		stderr.pipe(logger, { end: false });

		await p;

		logger.close();
	}
}

description(runForEach, 'Run a same command in every project directory.');
