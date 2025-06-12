import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { unlink } from 'node:fs/promises';
import { isAbsolute as isAbsoluteWin32 } from 'node:path/win32';
import { resolve } from 'node:path';
import type { ICProjectConfig, IRushConfig } from '../../api/limitedJson.js';
import { RushProject } from '../../api/rushProject.js';
import type { ArgOf } from '../../common/args.js';
import { blacklistDependency, resolveNpm, splitPackageSpecSimple } from '../../common/npm.js';
import { info } from '../../common/output.js';
import { runUpdate } from '../update/execute.js';

let _fixLocal = false;

export async function runUpgrade({ dryRun, fixLocal, skipUpdate }: ArgOf<typeof import('./arguments')>) {
	_fixLocal = fixLocal;

	const rush = new RushProject();

	info('Collecting local project versions:');
	const alldeps: Record<string, string> = {};
	const decoupled: Record<string, string> = {};
	for (const project of [...rush.projects, ...rush.autoinstallers]) {
		const packageJson = rush.packageJsonContent(project);
		const myDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
		Object.assign(alldeps, filter(myDeps));

		if (project.decoupledLocalDependencies) {
			for (const item of project.decoupledLocalDependencies) {
				const project = rush.getProject(item);
				if (project.shouldPublish) {
					decoupled[project.packageName] = `^${rush.packageJsonContent(project).version}`;
				}
			}
		}

		const size = Object.keys(myDeps).length;
		console.log(
			'  * %s%s - %s dep%s',
			project.isAutoInstaller ? '[auto-installer] ' : '',
			project.packageName,
			size,
			size > 1 ? 's' : ''
		);
	}

	for (const project of rush.projects) {
		if (Object.hasOwn(alldeps, project.packageName)) {
			decoupled[project.packageName] = alldeps[project.packageName];
			delete alldeps[project.packageName];
		}
	}

	for (const depLock of Object.keys(rush.preferredVersions)) {
		delete alldeps[depLock];
	}

	collectRush(alldeps, rush);

	info('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));
	info('Resolving decoupled local dependencies:');
	const dMap = await resolveNpm(new Map(Object.entries(decoupled)));

	for (const [name, version] of Object.entries(rush.preferredVersions)) {
		map.set(name, version);
	}

	info('Write changed files:');
	let hasSomeChange = 0;
	for (const project of [...rush.projects, ...rush.autoinstallers]) {
		const packageJson = await rush.packageJsonForEdit(project);

		let numChange = 0;
		numChange += update(project, packageJson.dependencies, map);
		numChange += update(project, packageJson.devDependencies, map);
		if (project.isAutoInstaller) {
			numChange += update(project, packageJson.dependencies, dMap);
			numChange += update(project, packageJson.devDependencies, dMap);
		} else {
			numChange += await updateLocalDependency(rush, project, dMap);
		}

		if (dryRun) {
			console.log(
				'  * %s%s - %s change%s',
				project.isAutoInstaller ? '[auto-installer] ' : '',
				packageJson.name,
				numChange,
				numChange > 1 ? 's' : ''
			);
			continue;
		}

		const changed = await writeJsonFileBack(packageJson);

		if (changed) {
			console.log(
				'  * %s%s - %s change%s',
				project.isAutoInstaller ? '[auto-installer] ' : '',
				packageJson.name,
				numChange,
				numChange > 1 ? 's' : ''
			);
		}
		hasSomeChange += numChange;
	}

	if (dryRun) {
		info('dry-run: quit now.');
		return;
	}

	info('Update rush and package manager:');
	hasSomeChange += await updateRushConfig(rush, map);

	if (hasSomeChange === 0) {
		info('OHHHH! No update!');
		return;
	}

	info('Delete temp file(s):');
	const tempfiles = [resolve(rush.projectRoot, 'common/config/rush/pnpm-lock.yaml')];
	for (const f of tempfiles) {
		try {
			await unlink(f);
			console.log('  * delete %s', f);
		} catch (e: any) {
			if (e.code === 'ENOENT') {
				continue;
			}
			throw e;
		}
	}

	if (skipUpdate) {
		console.error(`You should run "rush update" now`);
		return;
	}

	await runUpdate({ extra: [] });
}

function isLocalVersion(version: string) {
	return (
		version.startsWith('link:') ||
		version.startsWith('file:') ||
		version.startsWith('/') ||
		version.startsWith('.') ||
		isAbsoluteWin32(version)
	);
}

/**
 *
 * @param target 被更新的dependencies对象
 * @param map 解析后的版本号表
 */
function update(project: ICProjectConfig, target: Record<string, string>, map: Map<string, string>) {
	let changed = 0;
	info('updating: %s', project.packageName);
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
			if (!_fixLocal && isLocalVersion(currVer) && project.shouldPublish) {
				console.error(
					'[Alert] project "%s" dependency "%s" on filesystem, replace it before publish!',
					project.packageName,
					name
				);
				console.error('        add --publish/-P to automatic replace it.');
				continue;
			}

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

async function updateRushConfig(rush: RushProject, map: Map<string, string>) {
	let change = 0;
	const { type, version } = rush.getPackageManager();
	const config: IRushConfig = await loadJsonFile(rush.configFile);

	const rushVer = map.get('@microsoft/rush')?.slice(1);
	if (rushVer && rushVer !== config.rushVersion) {
		change++;
		config.rushVersion = rushVer;
		console.log('  * {project} - rush updated');
	}

	const pmVer = map.get(type)?.slice(1);
	if (pmVer !== version) {
		change++;
		if (type === 'npm') {
			config.npmVersion = pmVer;
		} else if (type === 'yarn') {
			config.yarnVersion = pmVer;
		} else {
			config.pnpmVersion = pmVer;
		}
		console.log('  * {project} - package manager updated');
	}

	if (change > 0) {
		await writeJsonFileBack(config);
	}

	return change;
}

function collectRush(alldeps: any, rush: RushProject) {
	if (!alldeps['@microsoft/rush']) {
		alldeps['@microsoft/rush'] = `^${rush.config.rushVersion}`;
	}
	const { type, version } = rush.getPackageManager();
	if (!alldeps[type]) {
		alldeps[type] = `^${version}`;
	}
}

function filter(map: Record<string, string>): Record<string, string> {
	for (const [name, value] of Object.entries(map)) {
		if (blacklistDependency(name, value)) {
			delete map[name];
		}

		if (value === '*' || value === '') {
			delete map[name];
		}
		if (
			isLocalVersion(value) || // standard unix/win32 path
			value.includes('/') || // unix path, url, github user/repo, @package/scope, http://
			value.includes('\\') // win32 path
		) {
			// console.log('\x1B[2mnot supported protocol: %s: %s\x1B[0m', name, value);
			delete map[name];
		}
		if (value.startsWith('workspace:')) {
			// pnpm specific
			delete map[name];
		}
		if (value.startsWith('npm:')) {
			// package alias
			const [alias, version] = splitPackageSpecSimple(value.substring(4));
			delete map[name];
			map[alias] = version;
		}
	}
	return map;
}

/**
 * 更新本地项目间decoupled依赖
 * @param dMap 所有存在被循环依赖的项目，对应解析后的版本号
 */
async function updateLocalDependency(rush: RushProject, project: ICProjectConfig, dMap: Map<string, string>) {
	let change = 0;
	if (!project.decoupledLocalDependencies) return change;

	const localMap = new Map<string, string>();
	for (const item of project.decoupledLocalDependencies) {
		const v = dMap.get(item);
		if (!v) continue; // must be private

		localMap.set(item, v);
	}

	const packageJson = await rush.packageJsonForEdit(project);
	change += update(project, packageJson.dependencies, localMap);
	change += update(project, packageJson.devDependencies, localMap);

	return change;
}
