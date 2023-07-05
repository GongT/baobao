import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { checkChildProcessResult, streamPromise } from '@idlebox/node';
import { execa } from 'execa';
import ora from 'ora';
import { gte } from 'semver';
import split2 from 'split2';
import { findRushRootPath, loadConfig } from '../api/load';
import { NormalError } from './error';
import { spinner } from './temp-spin';

const REGTMPL = /^([0-9]+) of =projectCount=: \[([^\]]+)\] (.+)$/;
const startReg = /^\[([^\]]+)\] started$/;

export async function buildAction(action: string, argv: string[]) {
	const rushRoot = await findRushRootPath();
	const rushProjects = await loadConfig();
	if (!rushProjects) {
		throw new Error('not in rush project');
	}
	if (gte(rushProjects.rushVersion, '5.34.0')) {
		console.error('Use rush %s instead.', action);
		process.exit(1);
	}

	const projectCount = rushProjects.projects?.length ?? 0;

	if (projectCount === 0 || !rushRoot) {
		throw new NormalError('no project exists.');
	}

	let regTxt = REGTMPL.toString();
	regTxt = regTxt.slice(1, regTxt.length - 2);
	const isImportantLine = new RegExp(regTxt.replace('=projectCount=', projectCount.toFixed(0)));

	const ps = execa('rush', [action, ...argv], {
		stdio: ['inherit', 'pipe', 'pipe'],
	});

	const stdout = ps.stdout!.pipe(split2());
	const stderr = ps.stderr!.pipe(split2());

	const logFile = resolve(rushRoot, 'common/temp/build.log');
	const log = createWriteStream(logFile);
	console.error('Complete log file is at: %s', logFile);

	// delete ps.stdout;
	// delete ps.stderr;

	stdout.on('data', (line) => {
		log.write(removeEmpty(line) + '\n');
		handleLine(line);
	});
	stderr.on('data', (line) => {
		log.write(removeEmpty(line) + '\n');
		handleLine(line);
	});

	let lastWorks = 0;
	const workingSet = new Set<string>();
	const failedSet = new Set<string>();
	const PREFIX = 'Building [';
	const anime = ora({
		spinner,
		color: 'magenta',
		hideCursor: true,
		discardStdin: true,
		prefixText: PREFIX,
		text: '] starting...',
	});
	anime.start();
	// const width = anime.prefixText.length + spinner.frames[0].length + 2;

	const pss: Promise<any>[] = [ps, streamPromise(stderr), streamPromise(stdout)];
	await Promise.all(pss).then(
		() => {
			reset();

			anime.prefixText = '';
			try {
				checkChildProcessResult(ps);
				anime.succeed('All complete.');
			} catch (e: any) {
				anime.fail('Failed to build: ' + e.message + '\n' + [...failedSet.values()].join(', '));
			}
		},
		(e) => {
			ps.kill('SIGKILL');
			anime.prefixText = '';
			console.error((e as PromiseRejectedResult).reason);
			anime.fail('Failed to build: ' + e.message + '\n' + [...failedSet.values()].join(', '));
		}
	);

	function handleLine(text: string) {
		text = text.replace(/\x1B\[[0-9;]+m/g, '');
		if (startReg.test(text)) {
			const name = startReg.exec(text)![1]!;
			update(name, true);
		} else if (isImportantLine.test(text)) {
			const match = isImportantLine.exec(text)!;
			const name = match[2]!;
			const result = match[3]!;

			if (result.includes('skipped') || result.includes('had an empty script')) {
				print('♻', text);
			} else if (result.includes('completed')) {
				print('✅', text);
			} else if (result.includes('failed')) {
				print('💥', text);
				failedSet.add(name);
			}

			update(name, false);
		} else {
			// console.log('\x1B[2m - %s\x1B[0m', text);
		}
	}

	function update(name: string, working: boolean) {
		if (working) {
			workingSet.add(name);
		} else {
			workingSet.delete(name);
		}

		reset();

		const works = [...workingSet.values()].slice(0, process.stderr.rows - 1);
		for (const name of works) {
			const l = '⏳ ' + name;
			console.error(l.slice(0, (process.stderr.columns || 80) - 2));
			lastWorks++;
		}

		anime.text = `] Building ${workingSet.size} project${workingSet.size > 1 ? 's' : ''}`;
		anime.render();
	}

	function print(symbol: string, text: string) {
		reset();
		console.error('\r\x1B[K%s  %s', symbol, text);
	}

	function reset() {
		anime.clear();
		if (lastWorks > 0) {
			process.stderr.write(`\x1B[${lastWorks}A\r\x1B[J`);
			lastWorks = 0;
		}
	}

	function removeEmpty(input: string) {
		return input.replace(/\x1B\[[0-9;]+m/g, '');
	}
}
