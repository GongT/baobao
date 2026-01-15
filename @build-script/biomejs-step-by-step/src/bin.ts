import type { Diagnostic } from '@biomejs/js-api/nodejs';
import { startChokidar } from '@idlebox/chokidar';
import { argv, logger, makeApplication } from '@idlebox/cli';
import { mergeIterables, registerGlobalLifecycle } from '@idlebox/common';
import { shutdown, workingDirectory } from '@idlebox/node';
import { execa } from 'execa';
import { resolve } from 'node:path';
import { stderr } from 'node:process';
import { autofix } from './autofix.js';
import { printDiagnostic } from './format.js';

makeApplication({ name: 'biomejs-step-by-step', description: 'Step by step lint with biomejs' }).simple(
	{
		args: {
			'--cwd': {
				flag: false,
				description: 'working directory, defaults to process.cwd()',
			},
		},
		help: '',
		usage: '',
	},
	main,
);

type Result = {
	diagnostics: readonly Diagnostic[];
};

async function main() {
	let issueFiles = new Set<string>();

	const workingDir = resolve(process.cwd(), argv.single(['--cwd']) || '.');
	logger.info`启动 biome，工作目录 long<${workingDir}>`;
	workingDirectory.chdir(workingDir);
	registerGlobalLifecycle(autofix);

	// const configPath = await findUpUntil({ file: ['biome.json', 'biome.jsonc'], from: workingDir });
	// if (!configPath) throw new Error('无法找到 biome.json 或 biome.jsonc 配置文件');
	// const content = await loadJsonFile(configPath, 'utf-8');

	async function execute(changed_files: Iterable<string> = []) {
		autofix.detach();
		console.log('\n文件发生变化，重新检查中...');

		for (const file of mergeIterables(changed_files, issueFiles.values())) {
			const check_passed = await singleExecute(file);
			if (check_passed) {
				issueFiles.delete(file);
				watcher.delete(file);
				logger.success`文件 long<${file}> 检查通过 (还有大约 ${issueFiles.size} 个)`;
				continue;
			}

			return;
		}

		stderr.write('\x1Bc');
		await syncWatcher();
	}

	async function singleExecute(file: string) {
		try {
			const process = await execa({ cwd: workingDir, reject: false })`biome lint --max-diagnostics=none --reporter=json ${file}`;
			const { diagnostics } = JSON.parse(process.stdout) as Result;
			if (diagnostics.length === 0) {
				return true;
			}

			const diagnostic = diagnostics.find((e) => typeof e.location === 'object') || diagnostics[0];

			stderr.write('\x1Bc');

			printDiagnostic(diagnostic, workingDir, file);

			const fixable = diagnostics.map((d) => d.tags.includes('fixable'));
			if (fixable.some((v) => v)) {
				if (fixable.every((v) => v)) {
					console.log('\n\x1B[38;5;10m可自动修复\x1B[0m');
				} else {
					console.log('\n\x1B[38;5;10m部分问题可自动修复\x1B[0m');
				}
				autofix.prompt(file);
			} else {
				console.log('\n\x1B[38;5;11m不可自动修复\x1B[0m');
			}
		} catch (error) {
			logger.error`biome lint 失败: ${error}`;
		}
		return false;
	}

	async function fullExecute() {
		try {
			const result = new Set<string>();
			const process = await execa({ cwd: workingDir, reject: false })`biome lint --max-diagnostics=none --reporter=json`;
			const { diagnostics } = JSON.parse(process.stdout) as Result;
			for (const { location } of diagnostics) {
				if (typeof location.path === 'object') {
					result.add(resolve(workingDir, location.path.file));
				}
			}

			issueFiles = result;
		} catch (e) {
			logger.error`biome lint 失败: ${e}`;
		}
	}

	async function syncWatcher() {
		await fullExecute();
		if (issueFiles.size) {
			watcher.add(Array.from(issueFiles.values()));
		} else {
			logger.success`没有发现任何问题`;
			shutdown(0);
		}
	}

	const watcher = startChokidar(execute, {
		cwd: workingDir,
		watchingEvents: ['change'],
		ignoreInitial: false,
	});

	await syncWatcher();
	await execute();
}
