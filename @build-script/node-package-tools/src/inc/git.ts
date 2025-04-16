import { commandInPath, emptyDir, execLazyError, exists } from '@idlebox/node';
import { execaCommand } from 'execa';
import { resolve } from 'path';
import { debug, log } from './log';

export async function gitInit(cwd: string) {
	if (!(await commandInPath('git'))) {
		throw new Error('git必须在PATH中');
	}

	const gitDir = resolve(cwd, '.git');
	if (await exists(gitDir)) {
		await emptyDir(gitDir);
	}
	debug(' + git init');
	await execaCommand('git init', { cwd, stdout: process.stderr, stderr: 'inherit' });
	debug(' + git add .');
	await execaCommand('git add .', { cwd, stdout: process.stderr, stderr: 'inherit' });
	await execLazyError('git', ['commit', '-m', 'Init'], { cwd, stdout: 'ignore', verbose: true });
	log('(初始化完成)');
}

export async function gitChange(cwd: string) {
	log('检测文件更改:');

	debug(' + 检查 git 状态');
	const { stdout: testOut } = await execaCommand('git status', { cwd, stdout: 'pipe', stderr: 'inherit' });
	const statusOut = testOut.toString().trim();
	if (statusOut.includes('nothing to commit, working tree clean')) {
		log('    git工作区状态: 干净');
		return [];
	} else {
		// debug(statusOut);
		log('    git工作区状态: 有修改');
		// await execaCommand('git diff', { cwd, stdout: 'pipe', stderr: 'pipe' });
	}

	debug(' + git add .');
	await execaCommand('git add .', { cwd, stdout: process.stderr, stderr: 'inherit' });
	await execLazyError('git', ['commit', '-m', 'DetectChangedFiles'], { cwd, stdout: 'ignore', verbose: true });

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
		throw new Error('运行git commit，未知错误');
	}
	const files = lines.slice(titleLine + 1);

	return files.map((item) => {
		return item.replace('Would remove ', '');
	});
}
