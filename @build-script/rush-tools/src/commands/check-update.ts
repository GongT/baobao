import { resolve } from 'path';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { pathExists, unlink } from 'fs-extra';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { info } from '../common/output';

/** @internal */
export default async function runCheckUpdate() {
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

	info('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));

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

description(runCheckUpdate, 'Upgrade all dependencies of every project.');
