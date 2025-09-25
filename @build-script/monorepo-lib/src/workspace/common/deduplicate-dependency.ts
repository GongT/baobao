import type { IMyLogger } from '@idlebox/logger';
import { resolve } from 'node:path';
import type { IPackageInfoRW } from './types.js';

type IGlobalRemoveMap = Map<string /* 目标包名 */, string[]>;

/**
 * @private
 * @param logger
 * @param projects
 */
export function decoupleDependencies(logger: IMyLogger, projects: readonly IPackageInfoRW[]) {
	const global_removes: IGlobalRemoveMap = new Map();
	const local_names = projects.map((p) => p.packageJson.name);
	for (const name of local_names) {
		global_removes.set(name, []);
	}
	global_removes.set('*', []);

	for (const { packageJson, absolute: absolutePath } of projects) {
		const add_if_not = (r: string) => {
			const exists = global_removes.get(r);
			if (!exists) {
				const pkgFile = resolve(absolutePath, 'package.json');
				throw logger.fatal`decoupledDependents in long<${pkgFile}> specified a package "${r}" that is not in workspace.`;
			}
			exists.push(packageJson.name);
		};

		if (Array.isArray(packageJson.decoupledDependents)) {
			for (const decouplePackage of packageJson.decoupledDependents) {
				add_if_not(decouplePackage);
			}
		} else if (packageJson.decoupledDependents === '*') {
			add_if_not('*');
		} else if (packageJson.decoupledDependents) {
			const pkgFile = resolve(absolutePath, 'package.json');
			logger.fatal`decoupledDependents in long<${pkgFile}> must be an array, or "*", got "${packageJson.decoupledDependents}"`;
		}
	}

	logger.verbose`decoupled dependencies list<${global_removes}>`;

	for (const project of projects) {
		decoupleDependenciesProject(logger, project, global_removes.get(project.packageJson.name) ?? [], global_removes.get('*') ?? []);

		if (project.packageJson.additionalDependencies) {
			for (const dep of project.packageJson.additionalDependencies) {
				if (project.devDependencies.includes(dep)) continue;
				project.devDependencies.push(dep);
			}
		}

		logger.verbose`workspace dependencies list<${project.devDependencies}>`;
	}
}

function decoupleDependenciesProject(logger: IMyLogger, project: IPackageInfoRW, revert_removes: readonly string[], global_removes: readonly string[]) {
	logger.debug`decouple: project ${project.packageJson.name} dependencies: ${project.devDependencies.length}`;
	if (revert_removes.length === 0 && global_removes.length === 0 && !project.packageJson.decoupledDependencies) {
		logger.debug`decouple: nothing to do`;
		return;
	}
	const dependencies = new Set(project.devDependencies);
	const productions = new Set(project.dependencies);

	const removes = project.packageJson.decoupledDependencies ?? [];
	if (Array.isArray(removes)) {
		for (const remove of [...removes, ...revert_removes]) {
			if (!dependencies.has(remove)) {
				const pkgFile = resolve(project.absolute, 'package.json');
				logger.fatal`decoupled dependency "${remove}" in long<${pkgFile}> not exists (or not workspace:)`;
			}

			logger.verbose`decouple: delete dependency "${remove}" from ${project.packageJson.name}`;
			dependencies.delete(remove);
			productions.delete(remove);
		}
		for (const remove of global_removes) {
			if (dependencies.has(remove)) {
				logger.verbose`decouple: delete dependency "${remove}" from ${project.packageJson.name}`;
				dependencies.delete(remove);
				productions.delete(remove);
			}
		}
	} else if (typeof removes === 'string') {
		if (removes === '*') {
			logger.verbose`decouple: force delete all dependencies from ${project.packageJson.name}`;
			dependencies.clear();
			productions.clear();
		} else if (removes === 'dev') {
			dependencies.clear();
			for (const item of productions) {
				dependencies.add(item);
			}
		} else {
			const pkgFile = resolve(project.absolute, 'package.json');
			logger.fatal`decoupledDependencies in long<${pkgFile}> must be an array, or "*"/"dev", got "${removes}"`;
		}
	} else {
		const pkgFile = resolve(project.absolute, 'package.json');
		logger.fatal`decoupledDependencies in long<${pkgFile}> must be an array, got ${typeof removes}`;
	}

	project.devDependencies = Array.from(dependencies);
	project.dependencies = Array.from(productions);

	logger.debug`decouple: finished: ${project.devDependencies.length + project.dependencies.length} remains`;
}
