import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';
import { RushProject } from '../api/rushProject';

export default async function runAutoFix() {
	const localHardVersions = new Map<string, string>(); // 本地硬性依赖，不允许指定其他值
	const cyclicVersions = new Map<string, string>(); // 循环依赖 - 必须去npm请求才能确定
	const conflictingVersions = new Map<string, string>(); // 有冲突，需要处理的依赖
	const blacklist = new Set<string>();
	const packageJsons: any[] = [];
	const cyclicPackages = new Map<string, string[]>(); // 循环依赖 - 必须去npm请求才能确定

	console.log('Finding local project versions:');
	const rush = new RushProject();
	for (const { projectFolder, packageName, cyclicDependencyProjects } of rush.projects) {
		let version: string;
		const pkgFile = resolve(rush.absolute(projectFolder), 'package.json');
		try {
			const data = await loadJsonFile(pkgFile);
			packageJsons.push(data);
			version = data.version;

			if (data.private) {
				blacklist.add(packageName);
			}
		} catch (e) {
			throw new Error(`Cannot parse package.json of "${packageName}": ${e.message}`);
		}
		console.log(' - %s: %s', packageName, version);
		localHardVersions.set(packageName, '^' + version);

		if (cyclicDependencyProjects && cyclicDependencyProjects.length > 0) {
			cyclicPackages.set(packageName, cyclicDependencyProjects.slice());
			for (const id of cyclicDependencyProjects) {
				cyclicVersions.set(id, '');
			}
		}
	}

	console.log('Resolving cyclic dependencies from NPM:');
	await resolveNpm(cyclicVersions);

	console.log('Load preferred versions: (common/config/rush/common-versions.json)');
	for (const [id, version] of Object.entries(rush.preferredVersions)) {
		if (localHardVersions.has(id)) warn('[Warn] preferredVersions includes local project: %s', id);
		localHardVersions.set(id, version);
		console.log(' - %s: %s', id, version);
	}

	console.log('Finding conflict dependencies:');
	const knownVersion = new Map<string, string>();
	for (const item of packageJsons) {
		const deps: { [id: string]: string } = Object.assign({}, item.dependencies, item.devDependencies);
		for (const [name, version] of Object.entries(deps)) {
			if (localHardVersions.has(name) || conflictingVersions.has(name)) {
				continue;
			}
			if (knownVersion.has(name)) {
				if (knownVersion.get(name) !== version) {
					console.log(' - found mismatch version of %s: %s', name, version);
					conflictingVersions.set(name, '');
				}
			} else {
				knownVersion.set(name, version);
			}
		}
	}
	knownVersion.clear();

	console.log('Resolving conflict dependencies from NPM:');
	await resolveNpm(conflictingVersions);

	console.log('Fixing versions:');
	let fixed = 0;
	const fix = (packName: string, deps: { [id: string]: string }) => {
		if (!deps) {
			return;
		}
		for (const depName of Object.keys(deps)) {
			let fix: string | undefined;
			if (blacklist.has(depName)) warn('package "%s" is depend on private package "%s"', packName, depName);

			if (cyclicPackages.get(packName)?.includes(depName)) {
				// this package have cyclic depend, and this dep is cyclic
				fix = cyclicVersions.get(depName)!;
			} else if (localHardVersions.has(depName)) {
				// depend on other package
				fix = localHardVersions.get(depName)!;
			} else if (conflictingVersions.has(depName)) {
				// depend on NPM package, and
				fix = conflictingVersions.get(depName)!;
			}

			if (fix && fix !== deps[depName]) {
				fixed++;
				console.log(
					'   - update dep [%s] of "%s" to version "%s" (from "%s")',
					depName,
					packName,
					fix,
					deps[depName]
				);
				deps[depName] = fix;
			}
		}
	};
	for (const item of packageJsons) {
		fix(item.name, item.dependencies);
		fix(item.name, item.devDependencies);

		if (await writeJsonFileBack(item)) {
			console.log('  updated %s', item.name);
		}
	}

	console.log('Done. Updated %s package%s.', fixed, fixed > 1 ? 's' : '');
}

function warn(msg: string, ...args: any[]) {
	console.log(`\x1B[38;5;9m${msg}\x1B[0m`, ...args);
}

description(runAutoFix, 'Auto fix any mismatch dependency versions, use newest one inside workspace.');
