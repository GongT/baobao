import { resolve } from 'path';
import { loadJsonFile, loadJsonFileSync, writeJsonFileBack, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { pathExists, unlink } from 'fs-extra';
import { IRushConfig } from '../api/limitedJson';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { info } from '../common/output';
import runUpdate from './update';

/** @internal */
export default async function runUpgrade(argv: string[]) {
	const rush = new RushProject();

	info('Collecting local project versions:');
	const alldeps: any = {};
	const jsonList: any[] = [];
	for (const project of rush.projects) {
		const pkgJson = rush.packageJsonPath(project);
		if (!pkgJson) {
			console.error('Error: package.json not found in: %s', project.projectFolder);
			process.exit(1);
		}

		const packageJson = await loadJsonFile(pkgJson);
		const myDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
		Object.assign(alldeps, myDeps);

		const size = Object.keys(myDeps).length;
		console.log('  * %s - %s dep%s', project.packageName, size, size > 1 ? 's' : '');

		jsonList.push(packageJson);
	}

	for (const project of rush.projects) {
		delete alldeps[project.packageName];
	}

	for (const depLock of Object.keys(rush.preferredVersions)) {
		delete alldeps[depLock];
	}

	collectRush(alldeps, rush);

	info('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));

	for (const [name, version] of Object.entries(rush.preferredVersions)) {
		map.set(name, version);
	}

	info('Write changed files:');
	let totalChange = 0;
	for (const packageJson of jsonList) {
		let numChange = update(packageJson.dependencies, map);
		numChange += update(packageJson.devDependencies, map);
		const changed = await writeJsonFileBack(packageJson);
		if (changed) {
			console.log('  * %s - %s change%s', packageJson.name, numChange, numChange > 1 ? 's' : '');
		}
		totalChange += numChange;
	}

	info('Update rush and package manager:');
	totalChange += updateRushConfig(rush, map);

	if (totalChange == 0) {
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
		const nver = map.get(item)!;
		if (!nver) {
			continue;
		}

		if (target[item] === nver) {
			continue;
		}

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

description(runUpgrade, 'Upgrade all dependencies of every project.');
