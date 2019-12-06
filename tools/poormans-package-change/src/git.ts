import { command } from 'execa';
import { log } from './log';
import commandExists = require('command-exists');

export async function gitInit(cwd: string) {
	if (!await commandExists('git')) {
		throw new Error('Please install git in PATH');
	}

	log('+ git init');
	await command('git init', { cwd, stdout: 'ignore', stderr: 'inherit' });
	log('+ git add .');
	await command('git add .', { cwd, stdout: 'ignore', stderr: 'inherit' });
	log('+ git commit -m Init');
	await command('git commit -m Init', { cwd, stdout: 'ignore', stderr: 'inherit' });
}

export async function gitChange(cwd: string) {
	log('+ git status');
	const { stdout: testOut } = await command('git status', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const statusOut = testOut.toString().trim();
	log('-----\n%s\n-----', statusOut);
	if (statusOut.includes('nothing to commit, working tree clean')) {
		log('git say: not change.');
		return [];
	}

	log('+ git add .');
	await command('git add .', { cwd, stdout: 'ignore', stderr: 'inherit' });
	log('+ git commit -m DetectChangedFiles');
	await command('git commit -m DetectChangedFiles', { cwd, stdout: 'ignore', stderr: 'inherit' });

	log('+ git log --name-only -1');
	const { stdout } = await command('git log --name-only -1', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const lines = stdout.toString().trim().split(/\n/g).map(i => i.trim()).filter(i => i.length > 0);
	const titleLine = lines.indexOf('DetectChangedFiles');
	if (titleLine === -1) {
		throw new Error('Failed to run git add or commit.');
	}
	const files = lines.slice(titleLine + 1);
	log('-----------\n%s\n-----------', files.join('\n'));
	log('%s lines of change', files.length);

	return files.map((item) => {
		return item.replace('Would remove ', '');
	});
}
