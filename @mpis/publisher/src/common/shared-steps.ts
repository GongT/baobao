import { logger } from '@idlebox/cli';
import type { IPackageJson } from '@idlebox/common';
import { commandInPath } from '@idlebox/node';
import { mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectPath, tempDir } from './constants.js';
import { execMute, execPnpmMute, execPnpmUser } from './exec.js';
import { decompressTarGz } from './tar.js';

export function getCurrentProject(): IPackageJson {
	const txt = readFileSync(resolve(projectPath, 'package.json'), 'utf-8');
	return JSON.parse(txt);
}

export function reconfigurePackageJson(name: string): IPackageJson {
	const packagePath = resolve(tempDir, name, 'package.json');
	const pkgJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

	if (pkgJson.scripts) {
		delete pkgJson.scripts.prepublishHook;

		const lifecycles = ['prepublishOnly', 'prepack', 'prepare', 'postpack'];

		for (const lifecycle of lifecycles) {
			if (pkgJson.scripts[lifecycle]) {
				logger.debug`删除生命周期脚本 ${lifecycle}`;
			}
			delete pkgJson.scripts[lifecycle];
		}
	}

	// TODO: sort

	writeFileSync(packagePath, JSON.stringify(pkgJson, null, 2));
	return pkgJson;
}

export async function buildPackageTarball() {
	const sourceTgz = resolve(tempDir, 'pnpm-packed-simple.tgz');

	logger.log`使用pnpm构建并打包……`;
	await execPnpmMute(projectPath, ['pack', '--out', sourceTgz]);

	logger.debug`已打包为 relative<${sourceTgz}>`;
	return sourceTgz;
}

export async function extractPackage(output: string, sourceTgz = resolve(tempDir, 'pnpm-packed-simple.tgz')) {
	const tempPackagePath = resolve(tempDir, output);
	mkdirSync(tempPackagePath, { recursive: false });

	await decompressTarGz(sourceTgz, tempPackagePath);

	logger.debug`已解压到 relative<${tempPackagePath}>`;

	const nm = resolve(projectPath, 'node_modules');
	const target_nm = resolve(tempPackagePath, 'node_modules');
	logger.verbose`symlink: long<${nm}>`;
	symlinkSync(nm, target_nm);

	logger.log`执行prepublishHook……`;
	await execPnpmUser(tempPackagePath, ['run', '--if-present', 'prepublishHook']);
	logger.success`prepublishHook成功完成`;

	unlinkSync(target_nm);

	return tempPackagePath;
}

export async function commitChanges(pkgJson: IPackageJson) {
	const git = await commandInPath('git');
	if (!git) {
		logger.warn`未找到git命令，跳过提交`;
		return;
	}

	const commitMessage = `release: ${pkgJson.name} v${pkgJson.version}`;

	try {
		await execMute(projectPath, [git, 'add', '.']);
		await execMute(projectPath, [git, 'commit', '.', '-m', commitMessage]);
		logger.success`✅ 已提交变更到git`;
	} catch (err: any) {
		if (err.message.includes('nothing to commit') || err.message.includes('no changes added to commit')) {
			logger.warn`🍴 git: 没有变更`;
			return;
		} else {
			logger.error`🍴 提交变更失败:`;
			console.error('\x1B[2m%s\x1B[0m\n', err.message);
		}
	}
}
