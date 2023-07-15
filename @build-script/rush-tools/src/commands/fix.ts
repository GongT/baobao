import { convertCatchedError } from '@idlebox/common';
import { writeJsonFileBack } from '@idlebox/node-json-edit';
import { ICProjectConfig } from '../api';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';
import { resolveNpm } from '../common/npm';

/** @internal */
export default async function runFix(argv: string[]) {
	return fix(argv).catch((e) => {
		throw convertCatchedError(e);
	});
}

async function fix(_argv: string[]) {
	const localHardVersions = new Map<string, string>(); // 本地硬性依赖，不允许指定其他值
	const conflictingVersions = new Map<string, string>(); // 有冲突，需要处理的依赖
	const locallist = new Set<string>();
	const blacklist = new Set<string>();

	console.log('Finding local project versions:');
	const rush = new RushProject();
	const dList = new Set<string>();
	for (const project of rush.projects) {
		if (project.decoupledLocalDependencies) {
			for (const i of project.decoupledLocalDependencies) {
				dList.add(i);
			}
		}

		const isPub = rush.isProjectPublic(project);

		if (isPub) {
			locallist.add(project.packageName);
		} else {
			blacklist.add(project.packageName);
		}
	}
	for (const pn of dList) {
		if (rush.isProjectPublic(rush.getProject(pn))) {
			console.log(' - found local dependency: %s', pn);
			conflictingVersions.set(pn, '');
		}
	}

	console.log('Load preferred versions: (common/config/rush/common-versions.json)');
	for (const [id, version] of Object.entries(rush.preferredVersions)) {
		if (localHardVersions.has(id)) warn('[Warn] preferredVersions includes local project: %s', id);
		localHardVersions.set(id, version);
		console.log(' - %s: %s', id, version);
	}

	console.log('Finding conflict dependencies:');
	const knownVersion = new Map<string, string>();
	for (const project of rush.projects) {
		const data = rush.packageJsonContent(project.projectFolder);
		const deps: { [id: string]: string } = Object.assign({}, data.dependencies, data.devDependencies);
		for (const [name, version] of Object.entries(deps)) {
			if (localHardVersions.has(name) || conflictingVersions.has(name)) {
				continue;
			}

			if (version === '*' || version === 'latest') {
				console.log(' - found glob version of %s: %s', name, version);
				conflictingVersions.set(name, '');
				continue;
			}

			if (locallist.has(name) || blacklist.has(name)) {
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
	const fix = (project: ICProjectConfig, deps: { [id: string]: string }, isDevDeps: boolean) => {
		if (!deps) {
			return;
		}
		let flShow = false;
		for (const [depName, lastValue] of Object.entries(deps)) {
			let fix: string | undefined;

			if (lastValue.startsWith('workspace:')) {
				// as is
			} else if (localHardVersions.has(depName)) {
				// depend on other package
				fix = localHardVersions.get(depName)!;
			} else if (conflictingVersions.has(depName)) {
				// depend on NPM package
				fix = conflictingVersions.get(depName)!;
			}

			if (fix && fix !== deps[depName]) {
				fixed++;
				console.log('    - update [%s] %s -> %s', depName, deps[depName], fix);
				deps[depName] = fix;
			}

			if (!isDevDeps && blacklist.has(depName)) {
				if (!flShow) {
					flShow = true;
					warn('Warning:');
				}
				warn('    ! package "%s" depend private "%s"', project.packageName, depName);
			}
		}
	};

	for (const project of rush.projects) {
		console.log('  %s:', project.packageName);
		const packageJson = await rush.packageJsonForEdit(project);
		fix(project, packageJson.dependencies, false);
		fix(project, packageJson.devDependencies, true);

		if (await writeJsonFileBack(packageJson)) {
			console.log('    ~ updated.');
		}
	}

	console.log('Done. Change %s version%s.', fixed, fixed > 1 ? 's' : '');
}

function warn(msg: string, ...args: any[]) {
	console.log(`\x1B[38;5;3m${msg}\x1B[0m`, ...args);
}

description(runFix, 'Auto fix any mismatch dependency versions, use newest one inside workspace.');
