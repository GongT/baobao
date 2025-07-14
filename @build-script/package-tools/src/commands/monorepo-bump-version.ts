import { humanDate } from '@idlebox/common';
import { makeRe } from 'minimatch';
import { argv, CommandDefine } from '../common/functions/cli.js';
import { CSI, writeHostLine, writeHostReplace } from '../common/functions/log.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';
import { prepareMonorepoDeps, type IGraphData } from '../common/workspace/dependency-graph.js';
import { createWorkspace } from '../common/workspace/workspace.js';

export class Command extends CommandDefine {
	protected override _usage = ``;
	protected override _description = '在monorepo中按照依赖顺序分别运行detect-package-change';
	protected override _help = '';
	protected override _arguments = {
		'--skip': { flag: false, description: '跳过前N-1个包（从第N个包开始运行）' },
		'--allow-private': { flag: true, description: '即使private=true也执行' },
		'--exclude': { flag: false, description: '排除指定的包' },
	};
}

export async function main() {
	let skip = Number.parseInt(argv.single('--skip') || '0');
	if (Number.isNaN(skip)) {
		throw new Error('skip 不是数字');
	}
	const allowPrivate = argv.flag('--allow-private') > 0;

	const workspace = await createWorkspace();
	const list = await workspace.listPackages();
	const deps = await prepareMonorepoDeps(list, true);

	if (!allowPrivate) {
		for (const data of deps.getIncompleteWithOrder()) {
			if (data.reference.packageJson.private) {
				writeHostLine(`🛑 跳过，private=true: ${data.name}`);
				deps.setComplated(data.name);
			}
		}
	}

	const excludes = argv.multiple('--exclude');
	let excludeReg: RegExp | undefined;
	if (excludes.length > 0) {
		let regTxt = [];
		for (const exclude of excludes) {
			const match = makeRe(exclude, { platform: 'linux' });
			if (!match) {
				throw new Error(`无法解析排除模式: ${exclude}`);
			}
			regTxt.push(match.source);
		}
		excludeReg = new RegExp(`^(${regTxt.join('|')})$`);
	}

	const changedPackages: string[] = [];
	const todoList = deps.getIncompleteWithOrder().filter(removeNoName);
	const w = todoList.length.toFixed(0).length;
	for (const [index, data] of todoList.entries()) {
		const startTime = Date.now();
		writeHostLine(`📦 [${(index + 1).toFixed(0).padStart(w)}/${todoList.length}] ${data.name}`);

		if (--skip > 0 || excludeReg?.test(data.name)) {
			writeHostReplace(`    ⏩ ${CSI}2m跳过${CSI}0m`);
			continue;
		}

		writeHostReplace(`    🔍 ${CSI}38;5;14m检查包${CSI}0m`);

		const pm = await createPackageManager(PackageManagerUsageKind.Write, workspace, data.reference.absolute);
		const { hasChange, remoteVersion } = await executeChangeDetect(pm, { forcePrivate: allowPrivate });

		if (!remoteVersion) throw new Error('程序错误, remoteVersion 为空');

		if (hasChange) {
			changedPackages.push(data.name);
			await increaseVersion(data.reference.packageJson, remoteVersion);
			writeHostReplace('    ✍️ 已修改本地包版本\n');
		} else {
			writeHostReplace(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
		}
	}

	writeHostLine(`🎉 所有任务完成，共修改了 ${changedPackages.length} 个包`);
}

function removeNoName(dep: IGraphData) {
	if (!dep.name) {
		return false;
	}
	return true;
}
