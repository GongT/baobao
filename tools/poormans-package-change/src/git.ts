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
	log('+ git clean -n -d');
	const { stdout } = await command('git clean -n -d', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const lines = stdout.toString().split(/\n/g);

	return lines.filter(i => i).map((item) => {
		return item.replace('Would remove ', '');
	});
}
