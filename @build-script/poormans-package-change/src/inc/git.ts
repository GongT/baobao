import { resolve } from 'path';
import { commandInPath, execLazyError } from '@idlebox/node';
import { execaCommand } from 'execa';
import { emptyDir, pathExists } from 'fs-extra';
import { debug, log } from './log';

export async function gitInit(cwd: string) {
	if (!(await commandInPath('git'))) {
		throw new Error('Please install git in PATH');
	}

	const gitDir = resolve(cwd, '.git');
	if (await pathExists(gitDir)) {
		await emptyDir(gitDir);
	}
	debug(' + git init');
	await execaCommand('git init', { cwd, stdout: process.stderr, stderr: 'inherit' });
	debug(' + git add .');
	await execaCommand('git add .', { cwd, stdout: process.stderr, stderr: 'inherit' });
	await execLazyError('git', ['commit', '-m', 'Init'], { cwd, stdout: 'ignore', verbose: true });
	log('(git init done)');
}

export async function gitChange(cwd: string) {
	log('Detect files change:');

	debug(' + git status');
	const { stdout: testOut } = await execaCommand('git status', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const statusOut = testOut.toString().trim();
	if (statusOut.includes('nothing to commit, working tree clean')) {
		log('    git say: clean');
		return [];
	} else {
		log('    git say: modified');
	}

	debug(' + git add .');
	await execaCommand('git add .', { cwd, stdout: process.stderr, stderr: 'inherit' });
	await execLazyError('git', ['commit', '-m', 'DetectChangedFiles'], { cwd, verbose: true });

	debug(' + git log --name-only -1');
	const { stdout } = await execaCommand('git log --name-only -1', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const lines = stdout
		.toString()
		.trim()
		.split(/\n/g)
		.map((i) => i.trim())
		.filter((i) => i.length > 0);
	const titleLine = lines.indexOf('DetectChangedFiles');
	if (titleLine === -1) {
		throw new Error('Failed to run git commit, unknown error.');
	}
	const files = lines.slice(titleLine + 1);

	return files.map((item) => {
		return item.replace('Would remove ', '');
	});
}
