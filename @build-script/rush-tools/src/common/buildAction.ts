import * as execa from 'execa';
import * as ora from 'ora';
import * as split2 from 'split2';
import { resolve } from 'path';
import { createWriteStream } from 'fs';
import { streamPromise } from '@idlebox/node';
import { findRushRootPath, loadConfig } from '../api/load';
import { NormalError } from './error';
import { spinner } from './temp-spin';

const REGTMPL = /^([0-9]+) of =projectCount=: \[([^\]]+)\] (.+)$/;
const startReg = /^\[([^\]]+)\] started$/;

export async function buildAction(action: string, argv: string[]) {
	const rushRoot = await findRushRootPath();
	const rushProjects = await loadConfig();
	const projectCount = rushProjects?.projects?.length ?? 0;

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

	const log = createWriteStream(resolve(rushRoot, 'common/temp/build.log'));

	// delete ps.stdout;
	// delete ps.stderr;

	stdout.on('data', (line) => {
		log.write(line + '\n');
		handleLine(line);
	});
	stderr.on('data', (line) => {
		log.write(line + '\n');
		handleLine(line);
	});

	const pss = ps.catch((e) => {
		throw new NormalError(e.message);
	});

	const workingSet = new Set<string>();
	const failedSet = new Set<string>();
	const PREFIX = '⏳  Building [';
	const anime = ora({
		spinner,
		color: 'magenta',
		hideCursor: true,
		discardStdin: true,
		prefixText: PREFIX,
		text: '] starting...',
	});
	anime.start();

	await Promise.allSettled([pss, streamPromise(stderr), streamPromise(stdout)]).then(([e]) => {
		anime.prefixText = '';
		if (failedSet.size || workingSet.size) {
			anime.clear();
			console.error((e as PromiseRejectedResult).reason);
			anime.fail('Failed to build: ' + [...failedSet.values()].join(', '));
		} else {
			anime.succeed('All complete.');
		}
	});

	function handleLine(text: string) {
		text = text.replace(/\x1B\[[0-9;]+m/g, '');
		if (startReg.test(text)) {
			const name = startReg.exec(text)![1];
			workingSet.add(name);
			update();
		} else if (isImportantLine.test(text)) {
			const match = isImportantLine.exec(text)!;
			const name = match[2];
			const result = match[3];

			workingSet.delete(name);
			update();

			if (result.includes('skipped') || result.includes('had an empty script')) {
				print('♻', text);
			} else if (result.includes('completed')) {
				print('✅', text);
			} else if (result.includes('failed')) {
				print('💥', text);
				failedSet.add(name);
			}
		} else {
			// console.log('\x1B[2m - %s\x1B[0m', text);
		}
	}

	function update() {
		// console.log('workingSet update:', [...workingSet.values()]);
		anime.text = `] Building ${workingSet.size} project(s)...`; // + [...workingSet.values()][0];
		anime.render();
	}

	function print(symbol: string, text: string) {
		console.error('\r%s  %s\x1B[K', symbol, text);
		anime.render();
	}
}
