import { resolve } from 'path';
import { convertCatchedError } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';

/** @internal */
export default async function runFix(argv: string[]) {
	return fix(argv).catch((e) => {
		throw convertCatchedError(e);
	});
}

async function fix(argv: string[]) {
	const localHardVersions = new Map<string, string>(); // 本地硬性依赖，不允许指定其他值
	const cyclicVersions = new Map<string, string>(); // 循环依赖 - 必须去npm请求才能确定
	const conflictingVersions = new Map<string, string>(); // 有冲突，需要处理的依赖
	const blacklist = new Set<string>();
	const packageJsons: any[] = [];
	const cyclicPackages = new Map<string, string[]>(); // 循环依赖 - 必须去npm请求才能确定

	console.log('Finding local project versions:');
	const rush = new RushProject();
	for (const { projectFolder, packageName, cyclicDependencyProjects, _isAutoInstaller } of rush.projects) {
		if (_isAutoInstaller) {
			continue;
		}

		const pkgFile = resolve(rush.absolute(projectFolder), 'package.json');
		const data = await loadJsonFile(pkgFile);

		const version = data.version;
		console.log(' - %s: %s', packageName, version);

		packageJsons.push(data);

		if (data.private) {
			blacklist.add(packageName);
		}

		localHardVersions.set(packageName, '^' + version);

		if (cyclicDependencyProjects && cyclicDependencyProjects.length > 0) {
			cyclicPackages.set(packageName, cyclicDependencyProjects.slice());
			for (const id of cyclicDependencyProjects) {
				cyclicVersions.set(id, '');
			}
		}
	}

	if (cyclicVersions.size > 0) {
		console.log('Resolving cyclic dependencies from NPM:');
		if (argv.includes('--skip-cyclic')) {
			console.log('  * Skip by --skip-cyclic. (%s)', [...cyclicVersions.keys()].join(', '));
		} else {
			await resolveNpm(cyclicVersions);
		}
	} else {
		console.log('Project do not have cyclic dependencies.');
	}

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
	const isWorkspaceEnabled = rush.isWorkspaceEnabled();
	const fix = (packName: string, deps: { [id: string]: string }, isDevDeps: boolean) => {
		if (!deps) {
			return;
		}
		for (const depName of Object.keys(deps)) {
			let fix: string | undefined;

			if (cyclicPackages.get(packName)?.includes(depName)) {
				// this package have cyclic depend, and this dep is cyclic
				fix = cyclicVersions.get(depName)!;
				if (isWorkspaceEnabled) {
					fix = 'npm:' + depName + '@' + fix;
				}
			} else if (localHardVersions.has(depName)) {
				// depend on other package
				fix = localHardVersions.get(depName)!;
				if (isWorkspaceEnabled) {
					fix = 'workspace:^'; // TODO: configurable
				}
			} else if (conflictingVersions.has(depName)) {
				// depend on NPM package, and
				fix = conflictingVersions.get(depName)!;
			}

			if (fix && fix !== deps[depName]) {
				fixed++;
				console.log('   - update [%s] %s -> %s', depName, deps[depName], fix);
				deps[depName] = fix;
			}
		}

		if (!isDevDeps && !blacklist.has(packName)) {
			let flShow = false;
			for (const depName of Object.keys(deps)) {
				if (blacklist.has(depName)) {
					if (!flShow) {
						flShow = true;
						warn('Warning:');
					}
					warn('    package "%s" depend private "%s"', packName, depName);
				}
			}
		}
	};

	for (const item of packageJsons) {
		fix(item.name, item.dependencies, false);
		fix(item.name, item.devDependencies, true);

		if (await writeJsonFileBack(item)) {
			console.log('  updated %s', item.name);
		}
	}

	console.log('Done. Change %s version%s.', fixed, fixed > 1 ? 's' : '');
}

function warn(msg: string, ...args: any[]) {
	console.log(`\x1B[38;5;3m${msg}\x1B[0m`, ...args);
}

description(runFix, 'Auto fix any mismatch dependency versions, use newest one inside workspace.');
