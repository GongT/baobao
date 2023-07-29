import { PromisePool } from '@supercharge/promise-pool';
import { execa } from 'execa';
import { readFile, writeFile } from 'fs/promises';
import { platform } from 'os';
import { resolve } from 'path';
import { format, getFileInfo, resolveConfig } from 'prettier';

console.log(process.argv);

let files: string[] = [];

if (process.argv.includes('--staged')) {
	await collectStagedFiles();

	const diff = await collect(['diff', '--name-status', '--no-renames']);
	const changed = getDiffChange(diff);
	const bothModify = [];
	for (const item of changed) {
		if (files.includes(item)) {
			bothModify.push(item);
		}
	}
	if (bothModify.length) {
		console.error(
			'\x1B[38;5;9msome staged file%s was modified again, this is not support.\x1B[0m',
			bothModify.length > 1 ? 's' : '',
		);
		for (const i of bothModify) console.log(i);
		process.exit(1);
	}
} else if (process.argv.includes('--all')) {
	await collectAllFiles();
} else if (process.argv.includes('--changed') || process.argv.length === 2) {
	await collectStagedFiles();
	await collectChangedFiles();
	await collectUntrackedFiles();
} else {
	console.error('Usage: node %s <--staged|--all|--changed>', process.argv[1]);
	process.exit(process.argv.includes('--help') ? 0 : 1);
}

files = files.filter((e, i) => {
	return i === files.lastIndexOf(e);
});
if (!files.length) {
	console.log('nothing to do.');
	process.exit(0);
}

const arrSep = platform() === 'win32' ? ';' : ':';
process.env.Path =
	resolve(process.cwd(), 'node_modules/.bin') + arrSep + resolve(process.argv0, '..') + arrSep + process.env.Path;

enum Action {
	ignore,
	unknown,
	modify,
	unchange,
}
interface IResult {
	action: Action;
	file: string;
}

const result = await new PromisePool(files)
	.withConcurrency(4)
	.handleError((e, file) => {
		console.error('failed format %s', file);
		console.error('    %s', e.stack);
	})
	.process(async (file): Promise<IResult> => {
		const finfo = await getFileInfo(file, { ignorePath: ['.prettierignore', '.gitignore'], resolveConfig: true });
		// console.log('[finfo=%s] %s', finfo, file);
		if (finfo.ignored) return { action: Action.ignore, file };

		const config = await resolveConfig(file, { editorconfig: true, config: '.prettierrc.js' });
		// console.log('[parser=%s] %s', finfo.inferredParser, file);
		if (!finfo.inferredParser) return { action: Action.unknown, file };
		if (!config.parser) config.parser = finfo.inferredParser;

		const input = await readFile(file, 'utf-8');

		const formatted = await format(input, { ...config, filepath: file });

		if (formatted === input) {
			console.log('✅ formatted: %s', file);
			return { action: Action.unchange, file };
		} else {
			await writeFile(file, formatted);
			console.log('✍️ formatted: %s', file);
			return { action: Action.modify, file };
		}
	});

const modifiedFiles = result.results.filter((e) => e.action === Action.modify).map((e) => e.file);

console.log(
	'%s jobs done, %s skip, %s fail.',
	modifiedFiles.length,
	result.results.filter((e) => e.action !== Action.modify).length,
	result.errors.length,
);

if (process.argv.includes('--staged') && modifiedFiles.length) {
	console.log((await collect(['add', ...modifiedFiles])).join('\n'));
}

process.exit(0);

function getDiffChange(lines: string[]) {
	return lines
		.filter((e) => 'ACMT'.includes(e[0]))
		.map((e) => {
			const s = e.split(/\s+/);
			s.shift();
			return s.join(' ');
		});
}

async function collectStagedFiles() {
	const diff = await collect(['diff', '--cached', '--name-status', '--no-renames']);
	const stagedChange = getDiffChange(diff);
	files.push(...stagedChange);
}

async function collectChangedFiles() {
	const diff = await collect(['diff', '--name-status', '--no-renames']);
	const changed = getDiffChange(diff);
	files.push(...changed);

	collectUntrackedFiles();
}
async function collectAllFiles() {
	collectUntrackedFiles();
	const tracked = await collect(['ls-files']);
	files.push(...tracked);
}
async function collectUntrackedFiles() {
	const status = await collect(['status', '--short']);
	const untracked = status.filter((e) => e.startsWith('?')).map((e) => e.split(/\s+/)[1]);
	files.push(...untracked);
}

async function collect(cmd: readonly string[]) {
	const result = await execa('git', cmd, { cwd: process.cwd(), all: true });
	if (result.failed || result.exitCode !== 0) {
		throw new Error(`git command failed: git ${cmd.join(' ')}`);
	}

	return result.all.split('\n').filter((e) => e);
}

// git diff --cached --name-status
// git diff --name-status
// git status --short
// git ls-files
