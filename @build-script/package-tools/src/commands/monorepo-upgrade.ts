import { createWorkspace, type IPackageInfo } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { resolve } from 'node:path';
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

	logger.log('Collecting local project versions:');
	const alldeps: Record<string, string> = {};
	for (const project of projects) {
		const myDeps = { ...project.packageJson.dependencies, ...project.packageJson.devDependencies };
		Object.assign(alldeps, filterDependencyToUpgrade(myDeps));

		const size = Object.keys(myDeps).length;
		logger.log(`  * ${project.name} -  ${size} dep${size > 1 ? 's' : ''}`);
	}

	logger.log('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));

	logger.log('Write changed files:');
	let hasSomeChange = 0;
	for (const project of projects) {
		const packageJson = await loadJsonFile(resolve(project.absolute, 'package.json'));

		let numChange = 0;
		numChange += update(project, packageJson.dependencies, map);
		numChange += update(project, packageJson.devDependencies, map);

		if (dryRun) {
			logger.log(`  * ${project.name} -  ${numChange} change${numChange > 1 ? 's' : ''}`);
			continue;
		}

		const changed = await writeJsonFileBack(packageJson);

		if (changed) {
			logger.log(`  * ${project.name} -  ${numChange} change${numChange > 1 ? 's' : ''}`);
		}
		hasSomeChange += numChange;
	}

	if (dryRun) {
		logger.log('dry-run: quit now.');
		return;
	}

	if (hasSomeChange === 0) {
		logger.log('OHHHH! No update!');
		return;
	}

	logger.log('Delete temp file(s):');

	if (skipUpdate) {
		logger.warn(`You should run "${packageManager.binary} update" now`);
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
	logger.log(`updating: ${project.name}`);
	if (!target) return changed;
	for (const [name, currVer] of Object.entries(target)) {
		if (currVer.startsWith('workspace:')) continue;

		let newVer = map.get(name);

		if (currVer.startsWith('npm:')) {
			// package alias
			const [alias] = splitPackageSpecSimple(currVer.substring(4));
			newVer = map.get(alias);
			if (!newVer) {
				// console.log('  - no version [%s] current [%s]', item, target[item]);
				continue;
			}
			newVer = `npm:${alias}@${newVer}`;
		}

		if (currVer === newVer) continue;

		if (newVer) {
			console.log('  - update package [%s] from [%s] to [%s]', name, currVer, newVer);
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
