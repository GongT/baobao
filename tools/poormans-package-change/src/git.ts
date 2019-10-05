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
	log(testOut.toString());

	log('+ git clean -n -d');
	const { stdout } = await command('git clean -n -d', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const lines = stdout.toString().trim().split(/\n/g).filter(i => i.trim());
	log('-----------');
	log(lines.join('\n'));
	log('-----------');
	log('%s lines of change', lines.length);

	return lines.map((item) => {
		return item.replace('Would remove ', '');
	});
}
