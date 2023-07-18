import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { DeepReadonly, IPackageJson, isWindows } from '@idlebox/common';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { exists, relativePath, writeFileIfChange } from '@idlebox/node';
import { loadJsonFile, readCommentJsonFileSync } from '@idlebox/node-json-edit';
import { requireRushPathSync } from '../common/loadRushJson';
import { ICProjectConfig, ICRushConfig, IProjectConfig, IRushConfig } from './limitedJson';

interface IProjectDependencyOptions {
	removeCyclic?: boolean;
	includingRuntime?: boolean;
}

export class RushProject {
	public readonly configFile: string;
	public readonly projectRoot: string;
	public readonly config: ICRushConfig;
	public readonly autoinstallers: readonly ICProjectConfig[];
	private declare _preferredVersions: { [id: string]: string };

	constructor(path: string = process.cwd()) {
		const configFile = requireRushPathSync(path);
		this.configFile = configFile;
		this.projectRoot = dirname(configFile);

		const config: IRushConfig = readCommentJsonFileSync(configFile);
		for (const project of config.projects ?? []) {
			if (project.decoupledLocalDependencies && project.cyclicDependencyProjects) {
				throw new Error(
					'rush.json contains invalid project: ' +
						JSON.stringify(project, null, 4) +
						' (cyclicDependencyProjects and decoupledLocalDependencies both exists)'
				);
			} else if (project.cyclicDependencyProjects) {
				console.error(
					'\x1B[38;5;11mdeprecated: cyclicDependencyProjects, use decoupledLocalDependencies.\x1B[0m'
				);
				project.decoupledLocalDependencies = project.cyclicDependencyProjects;
				delete project.cyclicDependencyProjects;
			}

			project.toString = () => {
				return project.packageName;
			};
		}

		this.config = config;
		Object.freeze(config);
		Object.freeze(config.pnpmOptions);
		config.projects.forEach(Object.freeze);
		Object.freeze(config.projects);

		this.autoinstallers = [];
		this.autoinstallers = this.listAutoInstallers();
	}

	private listAutoInstallers() {
		const AI_DIR = 'common/autoinstallers';
		const dir = resolve(this.projectRoot, AI_DIR);
		const ret: IProjectConfig[] = [];

		if (!existsSync(dir)) {
			return ret;
		}

		for (const item of readdirSync(dir)) {
			const pkgJson = resolve(dir, item, 'package.json');
			if (!existsSync(pkgJson)) {
				continue;
			}

			const decoupledLocalDependencies = [];
			const pkg = JSON.parse(readFileSync(pkgJson, 'utf-8'));
			const keys: string[] = [];
			if (pkg.dependencies) keys.push(...Object.keys(pkg.dependencies));
			if (pkg.devDependencies) keys.push(...Object.keys(pkg.devDependencies));
			for (const dep of keys) {
				if (this.getProjectByName(dep)) {
					decoupledLocalDependencies.push(dep);
				}
			}

			const rel = `${AI_DIR}/${item}`;
			ret.push({
				packageName: item,
				projectFolder: rel,
				decoupledLocalDependencies,
				isAutoInstaller: true,
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

	public get configRoot() {
		return resolve(this.projectRoot, 'common/config/rush');
	}

	public get preferredVersions() {
		if (!this._preferredVersions) {
			this._preferredVersions =
				readCommentJsonFileSync(resolve(this.projectRoot, 'common/config/rush/common-versions.json'))
					.preferredVersions || {};
		}
		return this._preferredVersions;
	}

	public get projects(): readonly ICProjectConfig[] {
		return this.config.projects;
	}

	public absolute(project: ICProjectConfig | string, ...segments: string[]): string {
		if (typeof project === 'string') {
			const p2 = this.getProjectByName(project);
			if (p2) {
				return resolve(this.projectRoot, p2.projectFolder, ...segments);
			} else {
				return resolve(this.projectRoot, project, ...segments);
			}
		} else {
			return resolve(this.projectRoot, project.projectFolder, ...segments);
		}
	}

	/** @deprecated */
	public getPackageByName(name: string): ICProjectConfig | null {
		return this.getProjectByName(name);
	}

	public getProject(name: string | ICProjectConfig) {
		if (typeof name === 'string') return this.getProjectByName(name, true);
		return name;
	}

	public isProjectPublic(project: ICProjectConfig) {
		if (project.isAutoInstaller) return false;

		if (project.shouldPublish === false) return false;

		const packageJson = this.packageJsonContent(project);
		if (packageJson.private === false) return false;

		return true;
	}

	public getProjectByName(name: string, required: true): ICProjectConfig;
	public getProjectByName(name: string, required?: false): ICProjectConfig | null;
	public getProjectByName(name: string, required = false): ICProjectConfig | null {
		let f = this.projects.find(({ packageName }) => name === packageName);
		if (!f) {
			f = this.autoinstallers.find(({ packageName }) => name === packageName);
		}
		if (!f && required) {
			throw new Error('missing project with name ' + name);
		}
		return f || null;
	}

	public packageJsonPath(project: ICProjectConfig | string): string | null {
		const p = resolve(this.absolute(project), 'package.json');
		return existsSync(p) ? p : null;
	}

	private packageJsonCache = new Map<string, any>();
	public packageJsonContent<T extends IPackageJson = IPackageJson>(
		project: ICProjectConfig | string
	): DeepReadonly<T> {
		const name = typeof project === 'string' ? project : project.packageName;
		if (!this.packageJsonCache.has(name)) {
			const pkgPath = this.packageJsonPath(name);
			if (!pkgPath) {
				throw new Error('missing package.json: ' + name);
			}

			const content = readCommentJsonFileSync(pkgPath);
			this.packageJsonCache.set(name, content);
		}

		return this.packageJsonCache.get(name)!;
	}

	private packageJsonCacheAsync = new Map<string, any>();
	public async packageJsonForEdit<T extends IPackageJson = IPackageJson>(
		project: ICProjectConfig | string
	): Promise<DeepReadonly<T>> {
		const name = typeof project === 'string' ? project : project.packageName;
		if (!this.packageJsonCacheAsync.has(name)) {
			const pkgPath = this.packageJsonPath(name);
			if (!pkgPath) {
				throw new Error('missing package.json: ' + name);
			}

			const content = await loadJsonFile(pkgPath);
			this.packageJsonCacheAsync.set(name, content);
		}

		return this.packageJsonCacheAsync.get(name)!;
	}

	public packageDependency(project: ICProjectConfig | string, options: IProjectDependencyOptions = {}): string[] {
		let projectName: string;
		let cyclicList: readonly string[];
		if (typeof project === 'string') {
			projectName = project;
			cyclicList = this.getProjectByName(project, true).decoupledLocalDependencies || [];
		} else {
			projectName = project.packageName;
			cyclicList = project.decoupledLocalDependencies || [];
		}

		const pkg = this.packageJsonContent(project);
		if (!pkg) {
			throw new Error('file json not readable: ' + project.toString());
		}
		const deps: { [id: string]: any } = { ...(pkg.devDependencies || {}) };
		if (options.includingRuntime && pkg.dependencies) {
			Object.assign(deps, pkg.dependencies);
		}

		for (const item of cyclicList) {
			if (!deps[item]) {
				console.warn(
					`\x1B[38;5;11mproject "${projectName}" set "${item}" as decoupled, but never depend on it\x1B[0m`
				);
			}
		}

		const localDepNames = [];
		for (const name of Object.keys(deps)) {
			if (typeof deps[name] !== 'string') {
				throw new Error(`project "${projectName}" package.json structure error`);
			}

			if (deps[name].startsWith('workspace:')) {
				if (!this.getProjectByName(name)) {
					throw new Error(`project "${projectName}" depend local "${name}", but not exists`);
				}
				if (cyclicList.includes(name) && (options.removeCyclic ?? true)) {
					continue;
				}

				localDepNames.push(name);
			} else if (this.getProjectByName(name)) {
				if (!cyclicList.includes(name)) {
					console.warn(
						`\x1B[38;5;11mproject "${projectName}" depend on "${name}" from npm, but not set decoupled\x1B[0m`
					);
				}
			}
		}

		return localDepNames;
	}

	isWorkspaceEnabled() {
		return this.config.pnpmOptions?.useWorkspaces; // TODO: how to get default?
	}

	getPackageManager(): { type: 'npm' | 'yarn' | 'pnpm'; bin: string; binAbsolute: string; version: string } {
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
			binAbsolute: resolve(this.tempRoot, `${type}-local/node_modules/.bin/${type}`),
		};
	}

	async copyNpmrc(project: ICProjectConfig | string, symlink: boolean = !isWindows, force: boolean = false) {
		const wantFile = this.absolute(project, '.npmrc');
		if (!force && (await exists(wantFile))) {
			return;
		}

		const source = resolve(this.configRoot, '.npmrc-publish');

		if (symlink) {
			const rel = relativePath(dirname(wantFile), source);
			console.log('create symlink: %s', wantFile);
			await ensureLinkTarget(rel, wantFile);
		} else {
			const changed = await writeFileIfChange(wantFile, await readFile(source, 'utf-8'));
			if (changed) {
				console.log('write file: %s', wantFile);
			}
		}
	}
}

function randomHash() {
	return createHash('md4')
		.update(Date.now().toFixed(0) + Math.random().toString())
		.digest('hex');
}
