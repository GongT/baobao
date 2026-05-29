import { createWorkspace, type IPackageInfo } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { isNotExistsError, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { resolve } from 'node:path';
import { loadYaml, writeYaml } from '../common/functions/yaml-tool.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { resolveNpm, splitAliasVersion, splitPackageSpecSimple } from '../common/package-manager/functions.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '更新monorepo中各个项目的所有依赖版本';
	protected override readonly _help = '被更新的包必须没有或者用^作为前缀';
}

export async function main() {
	const dryRun = argv.flag(['--dry']) > 0;
	const skipUpdate = argv.flag(['--skip-update']) > 0;

	const workspace = await createWorkspace();
	const packageManager = await createPackageManager(PackageManagerUsageKind.Read, workspace);
	const projects = await workspace.listPackages();

	logger.log('收集本地项目版本:');
	const alldeps: Record<string, string> = {};
	for (const project of projects) {
		const myDeps = { ...project.packageJson.dependencies, ...project.packageJson.devDependencies };
		Object.assign(alldeps, filterDependencyToUpgrade(myDeps));

		const size = Object.keys(myDeps).length;
		logger.log(`  * ${project.name} -  ${size} 个依赖`);
	}

	logger.log('解析 npm 注册表:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));

	logger.log('写入更改的文件:');
	let hasSomeChange = 0;
	for (const project of projects) {
		let packageJson: IPackageJson;
		let jsonMode = true;
		const json_file_path = resolve(project.absolute, 'package.json');
		try {
			packageJson = await loadJsonFile(json_file_path);
		} catch (e) {
			logger.verbose`读取文件relative<${json_file_path}>失败: ${e ? (e as any).code : e}`;
			if (!isNotExistsError(e)) {
				throw e;
			}

			try {
				packageJson = await loadYaml(resolve(project.absolute, 'package.yaml'));
				jsonMode = false;
				logger.debug`发现并使用 package.yaml 文件`;
			} catch (ee) {
				if (isNotExistsError(ee)) {
					throw e;
				}
				throw ee;
			}
		}

		let numChange = 0;
		numChange += update(project, packageJson.dependencies, map);
		numChange += update(project, packageJson.devDependencies, map);

		if (dryRun) {
			logger.log(`  * ${project.name} -  ${numChange} 个更改`);
			continue;
		}

		const changed = jsonMode ? await writeJsonFileBack(packageJson) : await writeYaml(packageJson);

		if (changed) {
			logger.log(`  * ${project.name} -  ${numChange} 个更改`);
		}
		hasSomeChange += numChange;
	}

	if (dryRun) {
		logger.log('DRY RUN: 提前退出');
		return;
	}

	if (hasSomeChange === 0) {
		logger.log('OHHHH! 没有更新!');
		return;
	}

	logger.log('删除临时文件:');

	if (skipUpdate) {
		logger.warn(`你现在应该运行 "${packageManager.binary} update"`);
		return;
	}

	await packageManager.install();
}

/**
 * @param target 被更新的dependencies对象
 * @param map 解析后的版本号表
 */
function update(project: IPackageInfo, target: Record<string, string>, map: Map<string, string>) {
	let changed = 0;
	logger.log(`更新: ${project.name}`);
	if (!target) return changed;
	for (const [name, currVer] of Object.entries(target)) {
		if (currVer.startsWith('workspace:')) continue;

		let newVer = map.get(name);

		if (currVer.startsWith('npm:')) {
			// package alias
			const [alias] = splitPackageSpecSimple(currVer.slice(4));
			newVer = map.get(alias);
			if (!newVer) {
				// console.log('  - no version [%s] current [%s]', item, target[item]);
				continue;
			}
			newVer = `npm:${alias}@${newVer}`;
		}

		if (currVer === newVer) continue;

		if (newVer) {
			logger.log(`  - 更新包[%s]版本号从[%s]到[%s]`, name, currVer, newVer);
			target[name] = newVer;
		} else {
			// console.log('  - no version [%s] current [%s]', item, target[item]);
			continue;
		}

		changed++;
	}
	return changed;
}

function filterDependencyToUpgrade(map: Record<string, string>) {
	const clone: Record<string, string> = {};
	for (const [name, version] of Object.entries(map)) {
		if (version === '*' || version === '') {
			continue;
		}

		const [alias, ver] = splitAliasVersion(version);

		if (ver) {
			clone[alias || name] = ver;
		}
	}
	return clone;
}
