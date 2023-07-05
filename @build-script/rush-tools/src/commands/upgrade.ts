import { resolve } from 'path';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { pathExists, unlink } from 'fs-extra';
import { ICProjectConfig, IRushConfig } from '../api/limitedJson';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { info } from '../common/output';
import runUpdate from './update';

/** @internal */
export default async function runUpgrade(argv: string[]) {
	const rush = new RushProject();

	info('Collecting local project versions:');
	const alldeps: Record<string, string> = {};
	const decoupled: Record<string, string> = {};
	for (const project of [...rush.projects, ...rush.autoinstallers]) {
		const packageJson = rush.packageJsonContent(project, true);
		const myDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
		Object.assign(alldeps, filter(myDeps));

		if (project.decoupledLocalDependencies) {
			for (const item of project.decoupledLocalDependencies) {
				decoupled[item] = '';
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
		if (project.shouldPublish) {
			if (Object.hasOwn(decoupled, project.packageName)) {
				decoupled[project.packageName] = '^' + rush.packageJsonContent(project, true).version;
			}
		} else {
			delete decoupled[project.packageName];
		}
		delete alldeps[project.packageName];
	}

	for (const depLock of Object.keys(rush.preferredVersions)) {
		delete alldeps[depLock];
	}

	collectRush(alldeps, rush);

	info('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));
	const dMap = await resolveNpm(new Map(Object.entries(decoupled)));

	for (const [name, version] of Object.entries(rush.preferredVersions)) {
		map.set(name, version);
	}

	info('Write changed files:');
	let hasSomeChange = 0;
	for (const project of [...rush.projects, ...rush.autoinstallers]) {
		const packageJson = rush.packageJsonContent(project, true);

		let numChange = 0;
		numChange += update(packageJson.dependencies, map);
		numChange += update(packageJson.devDependencies, map);
		numChange += resolveLocalDependency(rush, project, dMap);

		const changed = writeJsonFileBackSync(packageJson);

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

	info('Update rush and package manager:');
	hasSomeChange += updateRushConfig(rush, map);

	if (hasSomeChange == 0) {
		info('OHHHH! No update!');
		return;
	}

	info('Delete temp file(s):');
	const tempfiles = [resolve(rush.projectRoot, 'common/config/rush/pnpm-lock.yaml')];
	for (const f of tempfiles) {
		if (await pathExists(f)) {
			console.log('  * delete %s', f);
			await unlink(f);
		}
	}

	if (argv.includes('--skip-update')) {
		console.error(`You should run "rush update" now`);
		return;
	}

	await runUpdate([]);
}

function update(target: Record<string, string>, map: Map<string, string>) {
	let changed = 0;
	if (!target) return changed;
	for (const item of Object.keys(target)) {
		const nver = map.get(item);
		if (!nver) continue;

		if (target[item] === nver) continue;
		// console.log('  - update package [%s] from [%s] to [%s]', item, target[item], nver);
		target[item] = nver;

		changed++;
	}
	return changed;
}

function updateRushConfig(rush: RushProject, map: Map<string, string>): number {
	let change = 0;
	const { type, version } = rush.getPackageManager();
	const config: IRushConfig = loadJsonFileSync(rush.configFile);

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
		writeJsonFileBackSync(config);
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
		if (
			value.startsWith('.') ||
			value.startsWith('http') ||
			value.startsWith('ssh') ||
			value.startsWith('git') ||
			value.startsWith('/')
		) {
			console.log('\x1B[2mnot supported protocol: %s: %s\x1B[0m', name, value);
			delete map[name];
		}
		if (value.startsWith('workspace:')) {
			delete map[name];
		}
	}
	return map;
}
function resolveLocalDependency(rush: RushProject, project: ICProjectConfig, dMap: Map<string, string>) {
	let change = 0;
	if (!project.decoupledLocalDependencies) return change;

	const localMap = new Map<string, string>();
	for (const item of project.decoupledLocalDependencies) {
		const v = dMap.get(item);
		if (!v) continue; // must be private

		localMap.set(item, v);
	}

	const packageJson = rush.packageJsonContent(project, true);
	change += update(packageJson.dependencies, localMap);
	change += update(packageJson.devDependencies, localMap);

	return change;
}

description(runUpgrade, 'Upgrade all dependencies of every project.');
