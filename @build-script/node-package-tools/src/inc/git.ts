import { commandInPath, emptyDir, execLazyError, exists } from '@idlebox/node';
import { resolve } from 'path';
import { isVerbose } from './getArg.js';
import { logger } from './log.js';

export async function gitInit(cwd: string) {
	if (!(await commandInPath('git'))) {
		throw new Error('git必须在PATH中');
	}

	const gitDir = resolve(cwd, '.git');
	if (await exists(gitDir)) {
		await emptyDir(gitDir);
	}
	await execLazyError('git', ['init'], { cwd, verbose: isVerbose });
	await execLazyError('git', ['add', '.'], { cwd, verbose: isVerbose });
	await execLazyError('git', ['commit', '-m', 'Init'], { cwd, verbose: isVerbose });
	logger.log('(初始化完成)');
}

export async function gitChange(cwd: string) {
	logger.log('检测文件更改:');

	logger.debug(' + 检查 git 状态');
	const { stdout: testOut } = await execLazyError('git', ['status'], { cwd, verbose: isVerbose });
	const statusOut = testOut.toString().trim();
	if (statusOut.includes('nothing to commit, working tree clean')) {
		logger.log('    git工作区状态: 干净');
		return [];
	} else {
		// logger.debug(statusOut);
		logger.log('    git工作区状态: 有修改');
		// await execaCommand('git diff', { cwd, stdout: 'pipe', stderr: 'pipe' });
	}

	await execLazyError('git', ['add', '.'], { cwd, verbose: isVerbose });
	await execLazyError('git', ['commit', '-m', 'DetectChangedFiles'], { cwd, verbose: isVerbose });

	const { stdout } = await execLazyError('git', ['log', '--name-only', '-1'], { cwd, verbose: isVerbose });
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
