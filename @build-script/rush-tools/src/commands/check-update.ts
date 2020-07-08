import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { info } from '../common/output';

export default async function runCheckUpdate() {
	const rush = new RushProject();

	info('Collecting local project versions:');
	const alldeps: any = {};
	const jsonList: any[] = [];
	for (const project of rush.projects) {
		console.log('  * %s', project.packageName);
		const pkgJson = rush.packageJsonPath(project);
		if (!pkgJson) {
			console.error('Error: package.json not found in: %s', project.projectFolder);
			process.exit(1);
		}

		const packageJson = await loadJsonFile(pkgJson);
		Object.assign(alldeps, packageJson.dependencies, packageJson.devDependencies);

		jsonList.push(packageJson);
	}

	for (const project of rush.projects) {
		delete alldeps[project.packageName];
	}

	info('Resolving npm registry:');
	const map = await resolveNpm(new Map(Object.entries(alldeps)));

	info('Write changed files:');
	for (const packageJson of jsonList) {
		update(packageJson.dependencies, map);
		update(packageJson.devDependencies, map);
		const changed = await writeJsonFileBack(packageJson);
		if (changed) {
			console.log('  * %s', packageJson.name);
		}
	}
}

function update(target: Record<string, string>, map: Map<string, string>) {
	if (!target) return;
	for (const item of Object.keys(target)) {
		const nver = map.get(item)!;
		if (!nver) {
			continue;
		}

		if (target[item] === nver) {
			continue;
		}

		console.log('  - update package [%s] from [%s] to [%s]', item, target[item], nver);
		target[item] = nver;
	}
}

description(runCheckUpdate, 'Upgrade all dependencies of every project.');
