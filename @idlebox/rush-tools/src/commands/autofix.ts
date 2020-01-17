import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { eachProject } from '../api/each';
import { toProjectPathAbsolute } from '../api/load';
import { description } from '../common/description';
import { manifest } from 'pacote';

export default async function runAutoFix() {
	const knownVersions: { [id: string]: string } = {};
	const localVersions: { [id: string]: string } = {};
	const willResolveDeps: string[] = [];
	const packageJsons: any[] = [];

	console.log('Finding local project versions:');
	for (const { projectFolder, packageName } of eachProject()) {
		let version: string;
		const pkgFile = resolve(toProjectPathAbsolute(projectFolder), 'package.json');
		try {
			const data = await loadJsonFile(pkgFile);
			packageJsons.push(data);
			version = data.version;
		} catch (e) {
			throw new Error(`Cannot parse package.json of "${packageName}": ${e.message}`);
		}
		console.log(' - %s: %s', packageName, version);
		knownVersions[packageName] = '^' + version;
	}

	console.log('Finding conflict remote project versions:');
	for (const item of packageJsons) {
		const deps = Object.assign({}, item.dependencies, item.devDependencies);
		for (const [name, version] of Object.entries(deps)) {
			if (knownVersions[name] || willResolveDeps.includes(name)) {
				continue;
			}
			if (localVersions[name]) {
				if (localVersions[name] !== version) {
					console.log(' - found mismatched version of %s', name);
					willResolveDeps.push(name);
				}
			} else {
				localVersions[name] = version as string;
			}
		}
	}

	console.log('Resolving remote packages:');
	for (const packName of willResolveDeps) {
		process.stdout.write(' - ' + packName + ': ');
		knownVersions[packName] = await resolveNpmVersion(packName);
		console.log(knownVersions[packName]);
	}

	let fixed = 0;
	const fix = (packName: string, deps: { [id: string]: string }) => {
		if (!deps) {
			return;
		}
		for (const name of Object.keys(deps)) {
			if (!knownVersions[name]) {
				continue;
			}
			if (deps[name] !== knownVersions[name]) {
				deps[name] = knownVersions[name];
				fixed++;
				console.log(' - update dep [%s] of "%s" to version "%s"', name, packName, knownVersions[name]);
			}
		}
	};

	console.log('Fixing versions:');
	for (const item of packageJsons) {
		fix(item.name, item.dependencies);
		fix(item.name, item.devDependencies);

		await writeJsonFileBack(item);
	}

	console.log('Done. %s package%s fixed', fixed, fixed > 1 ? 's' : '');
}

async function resolveNpmVersion(packageName: string) {
	return '^' + (await manifest(packageName + '@latest')).version;
}

description(runAutoFix, 'Auto fix any mismatch dependency versions, use newest one inside workspace.');
