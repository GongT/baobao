import { dirname, resolve } from 'path';
import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { pathExistsSync, readdirSync, readJsonSync } from 'fs-extra';
import { requireRushPathSync } from '../common/loadRushJson';
import { Immutable, ImmutableArray } from './deepReadonly';
import { IProjectConfig, IRushConfig } from './limitedJson';

interface IProjectDependencyOptions {
	removeCyclic?: boolean;
	development?: boolean;
}

export class RushProject {
	public readonly configFile: string;
	public readonly projectRoot: string;
	public readonly config: Immutable<IRushConfig>;
	public readonly autoinstallers: ImmutableArray<IProjectConfig>;
	private declare _preferredVersions: { [id: string]: string };

	constructor(path: string = process.cwd()) {
		const configFile = requireRushPathSync(path);
		this.configFile = configFile;
		this.projectRoot = dirname(configFile);

		this.config = loadJsonFileSync(configFile);
		this.autoinstallers = [];
		this.autoinstallers = this.listAutoInstallers();
	}

	private listAutoInstallers() {
		const AI_DIR = 'common/autoinstallers';
		const dir = resolve(this.projectRoot, AI_DIR);
		const ret: IProjectConfig[] = [];
		for (const item of readdirSync(dir)) {
			const pkgJson = resolve(dir, item, 'package.json');
			if (!pathExistsSync(pkgJson)) {
				continue;
			}

			const cyclicDependencyProjects = [];
			const pkg = readJsonSync(pkgJson);
			const keys: string[] = [];
			if (pkg.dependencies) keys.push(...Object.keys(pkg.dependencies));
			if (pkg.devDependencies) keys.push(...Object.keys(pkg.devDependencies));
			for (const dep of keys) {
				if (this.getPackageByName(dep)) {
					cyclicDependencyProjects.push(dep);
				}
			}

			const rel = `${AI_DIR}/${item}`;
			ret.push({
				packageName: item,
				projectFolder: rel,
				cyclicDependencyProjects,
			});
		}
		return ret;
	}

	public get tempRoot() {
		return resolve(this.projectRoot, 'common/temp');
	}
	public tempFile(name: string = randomHash()) {
		return resolve(this.projectRoot, 'common/temp/.my-temp-folder/', name);
	}

	public get preferredVersions() {
		if (!this._preferredVersions) {
			this._preferredVersions =
				loadJsonFileSync(resolve(this.projectRoot, 'common/config/rush/common-versions.json'))
					.preferredVersions || {};
		}
		return this._preferredVersions;
	}

	public get projects(): Immutable<IProjectConfig[]> {
		return [...this.config.projects, ...this.autoinstallers];
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
		return this.projects.find(({ packageName }) => name === packageName) || null;
	}

	public packageJsonPath(project: Immutable<IProjectConfig> | string): string | null {
		const p = resolve(this.absolute(project), 'package.json');
		return pathExistsSync(p) ? p : null;
	}

	public packageJsonContent(project: Immutable<IProjectConfig> | string): any | null {
		const p = resolve(this.absolute(project), 'package.json');
		return pathExistsSync(p) ? readJsonSync(p) : null;
	}

	public packageDependency(
		project: Immutable<IProjectConfig> | string,
		{ removeCyclic, development }: IProjectDependencyOptions = {}
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
		if (removeCyclic) {
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
		for (const { packageName } of this.projects) {
			if (!deps[packageName]) continue;

			if (cyclicCheck && cyclicCheck.includes(packageName)) continue;

			depNames.push(packageName);
		}
		return depNames;
	}

	getPackageManager(): { type: 'npm' | 'yarn' | 'pnpm'; bin: string; version: string } {
		let type: 'npm' | 'yarn' | 'pnpm';
		let version: string;
		if (this.config.npmVersion) {
			type = 'npm';
			version = this.config.npmVersion;
		} else if (this.config.pnpmVersion) {
			type = 'pnpm';
			version = this.config.pnpmVersion;
		} else if (this.config.yarnVersion) {
			type = 'yarn';
			version = this.config.yarnVersion;
		} else {
			throw new Error('no package manager in rush.json');
		}

		return {
			type,
			version,
			bin: `common/temp/${type}-local/node_modules/.bin/${type}`,
		};
	}
}

import { createHash } from 'crypto';
function randomHash() {
	return createHash('md4')
		.update(Date.now().toFixed(0) + Math.random().toString())
		.digest('hex');
}
