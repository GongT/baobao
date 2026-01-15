import { argv } from '@idlebox/args/default';
import { execa } from 'execa';
import { basename } from 'node:path';
import { listenOutputStream } from './api.js';

const stdinMode = argv.flag(['--stdin']) > 0;
const startSignal = argv.single(['--start']) || '';
const finishSignal = argv.single(['--finish']);
const errorSignal = argv.single(['--error']);
const successSignal = argv.single(['--success']);

if (!finishSignal) {
	console.error('the --finish signal must be provided.');
	process.exit(1);
}
if (!startSignal && !finishSignal) {
	console.error('at least one of --start and --finish signal must be provided.');
	process.exit(1);
}
function throwUnused() {
	const unused = argv.unused();
	if (unused.length > 0) {
		console.error('unexpected arguments: %s', unused.join(' '));
		process.exit(1);
	}
}

let reading_stream: NodeJS.ReadableStream;
let title = '';
if (stdinMode) {
	throwUnused();
	reading_stream = process.stdin;
	process.stdin.pipe(process.stdout, { end: false });
} else {
	const command = argv.at(0);
	if (!command) {
		throw new Error('missing command to run');
	}
	const args = argv.range(1);
	title = basename(command);
	const p = execa(command, args, {
		all: true,
		stdio: ['ignore', 'pipe', 'pipe'],
		reject: false,
	});

	p.then((r) => {
		process.exitCode = r.exitCode ?? 1;
	});

	p.stdout.pipe(process.stdout, { end: false });
	p.stderr.pipe(process.stderr, { end: false });

	reading_stream = p.all;
}
const startRegex = startSignal ? new RegExp(startSignal, 'iv') : undefined;
const finishRegex = new RegExp(finishSignal, 'iv');
const errorRegex = errorSignal ? new RegExp(errorSignal, 'imv') : undefined;
const successRegex = successSignal ? new RegExp(successSignal, 'imv') : undefined;

listenOutputStream(reading_stream, {
	title,
	start: startRegex,
	stop: finishRegex,
	isFailed(_stop_line, full_output) {
		if (successRegex && errorRegex) {
			const succeed = successRegex.test(full_output);
			const errored = errorRegex.test(full_output);
			if (errored) {
				return false;
			}
			if (succeed) {
				return true;
			}
			return false;
		}

		if (successRegex) {
			return successRegex.test(full_output);
		}

		if (errorRegex) {
			return !errorRegex.test(full_output);
		}

		throw new Error('this is impossible');
	},
});
