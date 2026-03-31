import { applyPublishWorkspace } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { commandInPathSync, shutdown } from '@idlebox/node';
import { resolve } from 'node:path';
import { recreateTempFolder, repoRoot, tempDir } from '../common/constants.js';
import { execMute, execPnpmUser, registerLogError } from '../common/exec.js';
import { buildPackageTarball, commitChanges, extractPackage, reconfigurePackageJson } from '../common/shared-steps.js';

export class Command extends CommandDefine {
	protected override _usage: string = '';
	protected override _description: string = '发布当前项目到npm registry';
	protected override _help: string = `
publish命令会执行以下步骤：
1. 运行build和打包
2. 解压缩到临时文件夹并运行hook
3. 清理package.json
4. 发布到npm registry

`;
	protected override _arguments = {
		'--access': { flag: false, description: '添加 --access，可选值为 public 或 restricted' },
		'--dry-run': { flag: true, usage: true, description: '模拟发布，但不实际上传包' },
		'--force': { flag: true, description: '添加 --force' },
		'--no-git-checks': { flag: true, description: '添加 --no-git-checks' },
		'--publish-branch': { flag: false, description: '添加 --publish-branch，默认为“master”' },
		'--report-summary': { flag: true, description: '添加 --report-summary' },
		'--tag': { flag: false, description: '添加 --tag，默认为“latest”' },
		'--no-git': { flag: true, description: '发布后不进行git commit' },
		'--registry': { flag: false, description: '指定自定义的npm registry URL' },
		'--otp': { flag: false, description: '' },
	};
}

export async function main() {
	const publishArgs: string[] = [];

	const access = argv.single(['--access']);
	if (access) {
		publishArgs.push('--access', access);
	}
	const dryRun = argv.flag(['--dry-run']) > 0;
	if (dryRun) {
		publishArgs.push('--dry-run');
	}
	if (argv.flag(['--force']) > 0) {
		publishArgs.push('--force');
	}
	if (argv.flag(['--no-git-checks']) > 0) {
		publishArgs.push('--no-git-checks');
	}
	const branch = argv.single(['--publish-branch']);
	if (branch) {
		publishArgs.push('--publish-branch', branch);
	}
	if (argv.flag(['--report-summary']) > 0) {
		publishArgs.push('--report-summary');
	}
	const tag = argv.single(['--tag']);
	if (tag) {
		publishArgs.push('--tag', tag);
	}
	const registry = argv.single(['--registry']);

	const noGit = argv.flag(['--no-git']) > 0;

	const otp = argv.single(['--otp']);

	if (argv.unused().length > 0) {
		throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
	}

	if (otp) {
		publishArgs.push('--otp', otp);
	} else if (!process.stdin.isTTY) {
		logger.fatal`🚨 NPM当前要求使用二步验证发布包。但当前为非交互式终端，需使用 --otp 参数提供一次性密码。`;
	} else {
		if (process.env.BROWSER) {
			logger.debug`BROWSER=${process.env.BROWSER}`;
		} else {
			logger.warn`BROWSER 环境变量未设置，无法预期行为，最好设置它。`;
		}
	}

	registerLogError();

	// prepare
	await recreateTempFolder();

	// 运行build、打包
	await buildPackageTarball();

	// 解压缩到一个临时文件夹，其中解压缩步骤会运行hook
	const extractDir = await extractPackage('publish-working-directory');
	logger.log`临时文件目录: long<${extractDir}>`;

	// 简单清理
	const pkgJson = reconfigurePackageJson(extractDir);

	const workspaceFile = resolve(repoRoot, 'pnpm-workspace.yaml');
	const configRegistry = await applyPublishWorkspace({
		isPublish: true,
		sourceFile: workspaceFile,
		targetDir: tempDir,
	});

	if (registry) {
		publishArgs.push('--registry', registry);
	} else if (configRegistry) {
		publishArgs.push('--registry', configRegistry);
	}

	logger.success`🚀 准备完毕，即将向npm registry发送实际请求！`;
	await execPnpmUser(extractDir, ['publish', ...publishArgs]);

	logger.success`✅ 发布成功！`;

	if (dryRun) return shutdown(0);

	if (!noGit) await commitChanges(pkgJson);

	const cnpmBin = commandInPathSync('cnpm');
	if (cnpmBin) {
		logger.info`尝试同步到淘宝源`;
		try {
			await execMute(extractDir, [cnpmBin, 'sync', pkgJson.name]);
			logger.success`✅ 淘宝源同步成功！`;
		} catch {
			logger.error`🥲 淘宝源同步失败`;
		}
	}

	shutdown(0);
}
