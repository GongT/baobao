import { logger as defaultLogger, type IMyLogger } from '@idlebox/cli';
import { commandInPath, execLazyError, exists } from '@idlebox/node';
import { appendFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isVerbose } from '../functions/cli.js';
import { FileDiffOp, splitPatchFile } from './diff.js';

export async function requireGitInPath() {
	if (await commandInPath('git')) {
	} else {
		throw new Error('git必须在PATH中');
	}
}

export class GitWorkingTree {
	constructor(
		public readonly path: string,
		public readonly logger: IMyLogger = defaultLogger,
		private readonly abortSignal?: AbortSignal,
	) {}

	protected _exec(cmds: string[]) {
		return execLazyError('git', cmds, { cwd: this.path, verbose: isVerbose, cancelSignal: this.abortSignal });
	}

	async init() {
		this.logger.debug('初始化git工作区: %s', this.path);
		const gitDir = resolve(this.path, '.git');
		if (await exists(gitDir)) {
			this.logger.debug('   - 删除已有.git文件夹');
			await rm(gitDir, { recursive: true, force: true });
		}
		await this._exec(['init']);
		await appendFile(resolve(gitDir, 'info/attributes'), '*.map merge=binary\n');
		await this._exec(['add', '.']);
		await this._exec(['commit', '-m', 'Init']);
		this.logger.debug('(初始化完成)');
	}

	async commitChanges() {
		this.logger.debug('检测文件更改:');

		const { stdout: testOut } = await this._exec(['status']);
		const statusOut = testOut.toString().trim();
		if (statusOut.includes('nothing to commit, working tree clean')) {
			this.logger.debug('    git工作区状态: 干净');
			return [];
		}
		// if (isDebugMode) {
		// 	await execa('git', ['diff'], { cwd: this.path, stdio: ['ignore', 2, 2] });
		// }
		this.logger.debug('    git工作区状态: 有修改');

		await this._exec(['add', '.']);
		await this._exec(['commit', '-m', 'DetectChangedFiles']);

		const { stdout } = await this._exec(['log', '--name-only', '-1']);
		const lines = stdout
			.toString()
			.trim()
			.split(/\n/g)
			.map((i) => i.trim())
			.filter((i) => i.length > 0);
		const titleLine = lines.indexOf('DetectChangedFiles');
		if (titleLine === -1) {
			throw new Error('git commit - 未知错误');
		}
		const files = lines.slice(titleLine + 1);

		this.logger.debug('    文件更改: %d 个 (%s%s)', files.length, files.slice(0, 5).join(', '), files.length > 5 ? ' ...' : '');

		return files.map((item) => {
			return item.replace('Would remove ', '');
		});
	}

	async allDiff({ contextLines = 0 }: IDiffOptions = {}) {
		const { stdout } = await this._exec(['diff', '--color=never', `-U${contextLines}`, `HEAD~1`]);

		return splitPatchFile(stdout.toString().trim());
	}

	async fileDiff(file: string) {
		const { stdout } = await this._exec(['diff', '--color=never', '-U0', `HEAD~1`, file]);
		this.logger.verbose(stdout.trimEnd());
		const differ = new FileDiffOp(stdout.toString().trim());

		return differ.sideBySide({ heading: ['发布版本', '本地版本'] });
	}
}

interface IDiffOptions {
	readonly contextLines?: number;
}
