import { humanDate } from '@idlebox/common';
import { commandInPath } from '@idlebox/node';
import { execa } from 'execa';
import { resolve } from 'path';
import { prepareMonorepoDeps } from '../inc/dependency-graph.js';
import { argv, formatOptions, pArgS, pDesc } from '../inc/getArg.js';
import { CSI, logger, writeHostLine, writeHostReplace } from '../inc/log.js';
import { PackageMetaCache } from '../inc/meta-cache.js';
import { listMonoRepoPackages } from '../inc/mono-tools.js';
import { DETECT_CHANGE_METACACHE_KEY, executeChangeDetect } from '../inc/shared-jobs/detect-change-job.js';
import { publishPackageVersion } from '../inc/shared-jobs/publish-package-version-job.js';
import { increaseVersion } from '../packageManage/increaseVersion.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--dry')} ${pDesc('在monorepo中按照依赖顺序发布修改过的包')}`;
}
const args = {
	'--verbose': '列出所有信息，而不仅是目录',
	'--dry': '仅检查修改，不发布（仍会修改version字段）',
	'--debug': '运行后不要删除临时文件和目录',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const list = await listMonoRepoPackages();
	const deps = await prepareMonorepoDeps(list);
	const metacache = new PackageMetaCache();

	const dryRun = argv.flag('--dry') > 0;

	for (const data of deps.getIncompleteWithOrder()) {
		if (data.reference.packageJson.private) {
			writeHostLine(`🛑 跳过，private=true: ${data.name}`);
			deps.setComplated(data.name);
		}
	}

	const cnpm = await commandInPath('cnpm');

	const todoList = deps.getIncompleteWithOrder();
	const w = todoList.length.toFixed(0).length;
	for (const [index, data] of todoList.entries()) {
		const startTime = Date.now();
		writeHostLine(`📦 [${(index + 1).toFixed(0).padStart(w)}/${todoList.length}] ${data.name}`);
		writeHostReplace(`    🔍 ${CSI}38;5;14m检查包${CSI}0m`);

		const packageFile = resolve(data.reference.absolute, 'package.json');
		const { changedFiles, hasChange, remoteVersion } = await executeChangeDetect(
			packageFile,
			data.reference.packageJson
		);
		let shouldPublish = hasChange;

		if (!hasChange && changedFiles.length > 0) {
			shouldPublish = true;
		}
		if (!remoteVersion) throw new Error('程序错误, remoteVersion 为空');

		if (hasChange) {
			await increaseVersion(data.reference.packageJson, remoteVersion);
			writeHostReplace('    ✍️ 已修改本地包版本\n');
		}

		if (!shouldPublish) {
			writeHostReplace(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
			continue;
		}

		writeHostReplace(
			`🪄 正在发布新版本 ${data.reference.name} ${data.reference.packageJson.version} ==\ueac3==> ${remoteVersion}`
		);

		if (dryRun) {
			writeHostReplace(`    ✨ dry run (in ${humanDate.delta(Date.now() - startTime)})\n`);
			continue;
		}

		const detectMeta = await metacache.getCacheData(data.reference.name, DETECT_CHANGE_METACACHE_KEY);
		await detectMeta.delete();

		const changed = await publishPackageVersion(data.reference.absolute, data.reference.packageJson);

		if (changed) {
			writeHostReplace(`    ✨ ${CSI}38;5;10m已发布新版本！${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
		} else {
			writeHostReplace(`    🤔 此版本已经发布 (${remoteVersion})\n`);
		}

		if (cnpm) {
			const p = await execa(cnpm, ['sync', data.reference.name], { stdio: 'pipe', all: true, fail: false });
			if (p.failed || p.exitCode !== 0) {
				logger.line();
				logger.debug(p.all);
				writeHostLine(`    ⚠️  cnpm同步请求失败`);
			} else {
				writeHostLine(`    ✨ cnpm同步请求成功`);
			}
		}
	}
}
