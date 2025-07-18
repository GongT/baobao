import { createWorkspace } from '@build-script/monorepo-lib';
import { humanDate } from '@idlebox/common';
import { commandInPath } from '@idlebox/node';
import { argv, CommandDefine, CSI, pArgS } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { cnpmSync } from '../common/shared-jobs/cnpm-sync.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';
import { publishPackageVersion } from '../common/shared-jobs/publish-package-version-job.js';

export class Command extends CommandDefine {
	protected override _usage = `${pArgS('--verbose / --silent')} ${pArgS('--dry')}`;
	protected override _description = '在monorepo中按照依赖顺序发布修改过的包';
	protected override _help = '';
	protected override _arguments = {
		'--verbose': { flag: true, description: '列出所有信息，而不仅是目录' },
		'--dry': { flag: true, description: '仅检查修改，不发布（仍会修改version字段）' },
		'--debug': { flag: true, description: '运行后不要删除临时文件和目录' },
		'--skip': { flag: false, description: '跳过前N-1个包（从第N个包开始运行）' },
		'--private': { flag: false, description: '即使private=true也执行' },
	};
}

export async function main() {
	const dryRun = argv.flag('--dry') > 0;
	let skip = Number.parseInt(argv.single('--skip') || '0');
	if (Number.isNaN(skip)) {
		throw new Error('skip 不是数字');
	}

	const workspace = await createWorkspace();
	const list = await workspace.listPackages();
	const deps = await prepareMonorepoDeps(list);

	deps.detectLoop();

	if (argv.flag('--private') <= 0) {
		for (const data of deps.getIncompleteWithOrder()) {
			if (data.reference.packageJson.private) {
				console.log(`🛑 跳过，private=true: ${data.name}`);
				deps.setComp·lated(data.name);
			}
		}
	}

	const publishedPackages = [];

	const todoList = deps.getIncompleteWithOrder();
	const w = todoList.length.toFixed(0).length;
	for (const [index, data] of todoList.entries()) {
		const startTime = Date.now();
		console.log(`📦 [${(index + 1).toFixed(0).padStart(w)}/${todoList.length}] ${data.name}`);

		if (--skip > 0) {
			console.log(`    ⏩ ${CSI}2m跳过${CSI}0m`);
			continue;
		}

		console.log(`    🔍 ${CSI}38;5;14m检查包${CSI}0m`);

		const pm = await createPackageManager(PackageManagerUsageKind.Write, workspace, data.reference.absolute);
		const { changedFiles, hasChange, remoteVersion } = await executeChangeDetect(pm, {});
		let shouldPublish = hasChange;

		if (!hasChange && changedFiles.length > 0) {
			shouldPublish = true;
		}
		if (!remoteVersion) throw new Error('程序错误, remoteVersion 为空');

		if (hasChange) {
			await increaseVersion(data.reference.packageJson, remoteVersion);
			console.log('    ✍️ 已修改本地包版本\n');
		}

		if (!shouldPublish) {
			console.log(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
			continue;
		}

		console.log(
			`🪄 正在发布新版本 ${data.reference.name} ${data.reference.packageJson.version} ==\ueac3==> ${remoteVersion}`,
		);

		if (dryRun) {
			console.log(`    ✨ dry run (in ${humanDate.delta(Date.now() - startTime)})\n`);
			continue;
		}

		await publishPackageVersion(pm);

		// if (changed) {
		publishedPackages.push(data.reference);
		console.log(`    ✨ ${CSI}38;5;10m已发布新版本！${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
		// } else {
		// console.log(`    🤔 此版本已经发布 (${remoteVersion}/${data.reference.packageJson.version})\n`);
		// }
	}

	console.log(`🎉 所有任务完成，共发布了 ${publishedPackages.length} 个包`);

	if (await commandInPath('cnpm')) {
		await cnpmSync(publishedPackages, true).catch();
	}
}
