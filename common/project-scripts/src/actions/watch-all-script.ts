import { resolveRushProjectBuildOrder } from '@idlebox/rush-tools';
import { spawn, ChildProcess } from 'child_process';
import { resolve, relative } from 'path';
import { REPO_ROOT, NPM_BIN } from '../include/paths';
import { loadEnv } from '../include/envPass';
import { Readable } from 'stream';
import * as split2 from 'split2';

loadEnv();

interface CompileStatus {
	title: string;
	success: boolean;
	relative: string;
	absolute: string;
}

// TODO: support other compile type
const clearSeq = /\x1Bc/g;
const compileComplete = /Found 0 errors\. Watching for file changes\./;
const compileError = /Found [0-9]+ errors?\. Watching for file changes\./;
const timePart = /^[\x1B\[;m0-9]*\d+:\d+:\d+[\x1B\[\];m0-9]*\s/;
const filePath = /^.+\.ts\(\d+/;
const compileStatus: CompileStatus[] = [];

const needToWatch = resolveRushProjectBuildOrder()
	.map(({ packageName, projectFolder }) => {
		const path = resolve(REPO_ROOT, projectFolder);
		const pkg = require(resolve(path, 'package.json'));
		const watchScript: string = pkg.scripts && pkg.scripts.watch;
		return { packageName, path, watchScript };
	})
	.filter((obj) => obj.watchScript);

async function main() {
	for (const { packageName, path, watchScript } of needToWatch) {
		// console.error(' + run watch: %s (in) %s', watchScript, path);
		const p = spawn(watchScript, {
			cwd: path,
			shell: true,
			stdio: ['inherit', 'pipe', 'inherit'],
			env: process.env,
		});
		waitHandle(p);

		const status: CompileStatus = {
			title: packageName,
			success: false,
			absolute: path,
			relative: relative(REPO_ROOT, path),
		};
		compileStatus.push(status);

		await stdoutHandle(status, p.stdout);
	}
}

const ps = [];
function waitHandle(p: ChildProcess) {
	ps.push(p);
	p.on('exit', (code, signal) => {
		console.error('watch [%s] exit with %s', signal ? 'signal ' + signal : code);
		ps.forEach((p) => {
			p.kill('SIGINT');
		});
	});
}

function stdoutHandle(status: CompileStatus, stdout: Readable): Promise<void> {
	const split = stdout.pipe(split2());
	let allowClear = false;
	let shouldClear = false;

	return new Promise((resolve) => {
		split.on('data', function filterPassthrough(line: Buffer) {
			let toPrint: string = '';
			let data = line.toString();

			if (clearSeq.test(data)) {
				data = data.replace(clearSeq, '');
				if (allowClear) {
					shouldClear = true;
				}
			}
			data = data.replace(timePart, '');

			if (compileComplete.test(data)) {
				allowClear = true;
				resolve();
				toPrint += `\x1B[2m[${status.title}]\x1B[0m ${data}\n`;
				status.success = true;
			} else if (compileError.test(data)) {
				allowClear = true;
				toPrint += `\x1B[38;5;9m[${status.title}]\x1B[0m ${data}\n`;
				status.success = false;
			} else if (filePath.test(data)) {
				toPrint += `${status.relative}/${data}\n`;
			} else {
				toPrint += `${data}\n`;
			}

			if (shouldClear) {
				shouldClear = false;
				process.stdout.write('\x1Bc');
				dumpFailed();
			}

			process.stdout.write(toPrint);
		});
	});
}

function dumpFailed() {
	const failed = compileStatus.filter(({ success }) => !success);
	if (failed.length === 0) {
		return process.stdout.write('No project has error.\n');
	}
	process.stdout.write(failed.length + ' project can not compile:\n');
	for (const { title } of failed) {
		process.stdout.write(' * ' + title + '\n');
	}
}

main().then(
	() => {
		console.log(`\x1B[38;5;10mAll projects compiled at least one time.\x1B[0m `);
	},
	(e) => {
		setImmediate(() => {
			throw e;
		});
	}
);
