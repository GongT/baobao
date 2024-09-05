import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { unlink } from 'fs/promises';
import { isAbsolute as isAbsoluteWin32 } from 'node:path/win32';
import { resolve } from 'path';
import { ICProjectConfig, IRushConfig } from '../api/limitedJson';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { info } from '../common/output';
import runUpdate from './update';

let fixLocal = false;

/** @internal */
export default async function runUpgrade(argv: string[]) {
	const rush = new RushProject();

	fixLocal = argv.includes('--publish') || argv.includes('-P');

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
					decoupled[project.packageName] = '^' + rush.packageJsonContent(project).version;
				}
			}
		}

		const size = Object.keys(myDeps).length;
		console.log(
			'  * %s%s - %s dep%s',
			project.isAutoInstaller ? '[auto-installer] ' : '',
			project.packageName,
			size,
			size > 1 ? 's' : '',
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

		const changed = await writeJsonFileBack(packageJson);

		if (changed) {
			console.log(
				'  * %s%s - %s change%s',
				project.isAutoInstaller ? '[auto-installer] ' : '',
				packageJson.name,
				numChange,
				numChange > 1 ? 's' : '',
			);
		}
		hasSomeChange += numChange;
	}

	info('Update rush and package manager:');
	hasSomeChange += await updateRushConfig(rush, map);

	if (hasSomeChange == 0) {
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

	if (argv.includes('--skip-update')) {
		console.error(`You should run "rush update" now`);
		return;
	}

	await runUpdate([]);
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
	if (!target) return changed;
	for (const item of Object.keys(target)) {
		let nver = map.get(item);
		const curr = target[item];
		if (curr === nver) continue;

		if (curr.startsWith('npm:')) {
			// package alias
			const [alias] = splitPackageSpecSimple(curr.substring(4));
			nver = map.get(alias);
		}

		if (nver) {
			if (!fixLocal && isLocalVersion(curr) && project.shouldPublish) {
				console.error(
					'[Alert] project "%s" dependency "%s" on filesystem, replace it before publish!',
					project.packageName,
					item,
				);
				console.error('        add --publish/-P to automatic replace it.');
				continue;
			}

			// console.log('  - update package [%s] from [%s] to [%s]', item, target[item], nver);
			target[item] = nver;
		} else {
			// console.log('  - no version [%s] current [%s]', item, target[item]);
		}

		changed++;
	}
	return changed;
}

async function updateRushConfig(rush: RushProject, map: Map<string, string>) {
	let change = 0;
	const { type, version } = rush.getPackageManager();
	const config: IRushConfig = await loadJsonFile(rush.configFile);

	const rushVer = map.get('@microsoft/rush')!.slice(1);
	if (rushVer !== config.rushVersion) {
		change++;
		config.rushVersion = rushVer;
		console.log('  * {project} - rush updated');
	}

	const pmVer = map.get(type)!.slice(1);
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
		alldeps['@microsoft/rush'] = '^' + rush.config.rushVersion;
	}
	const { type, version } = rush.getPackageManager();
	if (!alldeps[type]) {
		alldeps[type] = '^' + version;
	}
}

function filter(map: Record<string, string>): Record<string, string> {
	for (const [name, value] of Object.entries(map)) {
		if (value === '*' || value === '') {
			delete map[name];
		}
		if (
			isLocalVersion(value) ||
			value.includes('/') || // unix path, url, github user/repo, @package/scope
			value.includes('\\') || // win32 path
			value.startsWith('link:') // not standard
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

function splitPackageSpecSimple(value: string) {
	const at = value.indexOf('@', 1);
	if (at === -1) return [value, '']; // @x/y
	return [value.substring(0, at), value.substring(at + 1)]; // @x/y@ver
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

description(runUpgrade, 'Upgrade all dependencies of every project.');
