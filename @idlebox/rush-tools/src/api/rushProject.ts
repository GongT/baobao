import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { pathExistsSync } from 'fs-extra';
import { dirname, resolve } from 'path';
import { Immutable } from './deepReadonly';
import { IProjectConfig, IRushConfig } from './limitedJson';
import { findRushJsonSync } from './load';

interface IProjectDependencyOptions {
	cyclic?: boolean;
	development?: boolean;
}

export class RushProject {
	public readonly configFile: string;
	public readonly projectRoot: string;
	public readonly config: Immutable<IRushConfig>;

	constructor(path: string = process.cwd()) {
		const configFile = findRushJsonSync(path);
		if (!configFile) {
			throw new Error('Can not find a "rush.json" from "' + path + '"');
		}
		this.configFile = configFile;
		this.projectRoot = dirname(configFile);

		this.config = loadJsonFileSync(configFile);
	}

	public get projects(): Immutable<IProjectConfig[]> {
		return this.config.projects || [];
	}

	public absolute(project: Immutable<IProjectConfig> | string, ...segments: string[]): string {
		if (typeof project === 'string') {
			const p2 = this.getPackageByName(project);
			if (p2) {
				return resolve(this.projectRoot, p2.projectFolder, ...segments);
			} else {
				return resolve(this.projectRoot, project, ...segments);
			}
		} else {
			return resolve(this.projectRoot, project.projectFolder, ...segments);
		}
	}

	public getPackageByName(name: string): Immutable<IProjectConfig> | null {
		return this.config.projects.find(({ packageName }) => name === packageName) || null;
	}

	public packageJsonPath(project: Immutable<IProjectConfig> | string): string | null {
		const p = resolve(this.absolute(project), 'package.json');
		return pathExistsSync(p) ? p : null;
	}

	public packageDependency(
		project: Immutable<IProjectConfig> | string,
		{ cyclic, development }: IProjectDependencyOptions = {}
	): string[] {
		const pkgFile = this.packageJsonPath(project);
		if (!pkgFile) {
			throw new Error('file not readable: ' + pkgFile);
		}
		const pkg = loadJsonFileSync(pkgFile);
		const deps: { [id: string]: any } = {};
		if (development !== true && pkg.dependencies) Object.assign(deps, pkg.dependencies);
		if (development !== false && pkg.devDependencies) Object.assign(deps, pkg.devDependencies);

		let cyclicCheck: Immutable<string[]> | undefined;
		if (cyclic) {
			if (typeof project === 'string') {
				const p = this.getPackageByName(project);
				if (!p) {
					throw new Error('project ' + project + ' does not exists.');
				}
				cyclicCheck = p.cyclicDependencyProjects;
			} else {
				cyclicCheck = project.cyclicDependencyProjects;
			}
		}

		const depNames: string[] = [];
		for (const { packageName } of this.config.projects) {
			if (!deps[packageName]) continue;

			if (cyclicCheck && cyclicCheck.includes(packageName)) continue;

			depNames.push(packageName);
		}
		return depNames;
	}
}
