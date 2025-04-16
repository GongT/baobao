import { PathEnvironment, exists, printLine } from '@idlebox/node';
import { resolve } from 'path';
import { gt } from 'semver';
import { getTarballCached, getVersionCached } from '../cache/tarball';
import { readJsonSync } from '../inc/fs';
import { argv, distTagInput, formatOptions, isJsonOutput, pArgS, pDesc, registryInput } from '../inc/getArg';
import { gitChange, gitInit } from '../inc/git';
import { errorLog, log, logEnable } from '../inc/log';
import { getTempFolder } from '../inc/mono-tools';
import { prepareWorkingFolder } from '../inc/temp-work-folder';
import { decompressTargz } from '../packageManage/decompress';
import { detectRegistry } from '../packageManage/detectRegistry';
import { downloadIfNot } from '../packageManage/downloadIfNot';
import { increaseVersion } from '../packageManage/increaseVersion';
import { packCurrentVersion } from '../packageManage/package';
import { rewritePackage } from '../packageManage/rewritePackage';

process.env.COREPACK_ENABLE_STRICT = '0';

export function usageString() {
	return `${pArgS('--bump')} ${pArgS('--json')} ${pDesc('本地运行npm pack并与npm上的最新版本对比差异')}`;
}
const args = {
	'--bump': '当发现更改时更新package.json，增加版本号0.0.1',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	process.env.LANG = 'C.UTF-8';
	process.env.LANGUAGE = 'C.UTF-8';

	const autoInc = argv.flag('--bump');
	const packagePath = process.cwd();
	log('工作目录: %s', packagePath);

	const p = new PathEnvironment();
	p.add(resolve(packagePath, 'node_modules/.bin'));
	p.add(resolve(process.argv0, '..'));
	for (const l in process.env) {
		if (l.startsWith('LC_')) {
			delete process.env[l];
		}
	}

	const packageFile = resolve(packagePath, 'package.json');

	if (!(await exists(packageFile))) {
		throw new Error('未找到 package.json 文件');
	}
	const packageJson = readJsonSync(packageFile);
	log('包名: %s', packageJson.name);
	log('=======================================');

	if (packageJson.private) {
		log('检测到私有包，禁止运行。');
		printResult([]);
		return 0;
	}

	const registry = await detectRegistry(registryInput, packagePath);

	const remoteVersion = await getVersionCached(packageJson.name, distTagInput, registry);
	log(' -> npm 远程版本 = %s', remoteVersion);
	log(' -> package.json 本地版本 = %s', packageJson.version);

	if (!remoteVersion || gt(packageJson.version, remoteVersion)) {
		errorLog('本地版本 (%s) 已经大于远程版本 (%s)，无需进一步更改。', packageJson.version, remoteVersion);
		printResult(['package.json'], false);
		return 0;
	} else {
		log('本地版本 (%s) 小于或等于远程版本 (%s)，尝试检测更改...', packageJson.version, remoteVersion);
	}

	const tempRoot = await getTempFolder(packagePath);
	const workingRoot = resolve(tempRoot, 'package-change/working');
	const tempFolder = await prepareWorkingFolder(workingRoot, packageJson.name, packageJson.version);
	const tempFile = resolve(workingRoot, `${normalizeName(packageJson.name)}-${packageJson.version}.tgz`);

	const tarball = await getTarballCached(packageJson.name, distTagInput, registry);
	if (!tarball) {
		throw new Error(`无法获取 tarball URL: "${packageJson.name}@${distTagInput}" 来自 "${registry}"`);
	}
	await downloadIfNot(tarball!, tempFile);
	await decompressTargz(tempFile, tempFolder);
	await rewritePackage(tempFolder);
	await gitInit(tempFolder);

	const pack = await packCurrentVersion(packagePath);
	log('  --> %s', pack);

	await decompressTargz(pack, tempFolder);
	await rewritePackage(tempFolder);
	const changedFiles = await gitChange(tempFolder);

	if (autoInc) {
		if (changedFiles.length) {
			log('自动增加版本号...');
			await increaseVersion(packageFile, remoteVersion);
		} else {
			log('没有检测到更改');
		}
	} else {
		printResult(changedFiles);
	}
	return 0;
}

function printResult(changedFiles: string[], changed?: boolean) {
	if (process.stdout.isTTY && !isJsonOutput) {
		if (changedFiles.length === 0) {
			console.log('changes: no');
		} else {
			if (logEnable) printLine();
			log('%s', changedFiles.join('\n'));
			if (logEnable) printLine();
			console.log('changes: yes');
		}
	} else {
		if (changed === undefined) {
			changed = changedFiles.length > 0;
		}
		console.log(JSON.stringify({ changedFiles, changed }));
	}
}

function normalizeName(name: string) {
	return name.replace(/^@/, '').replaceAll('/', '-');
}
