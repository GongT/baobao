import type { IPackageJson } from '@idlebox/common';
import { readCommentJsonFile } from '@idlebox/json-edit';
import { execLazyError, exists, findUpUntil, relativePath } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { logger } from '../functions/log.js';
import { cachedPackageJson } from '../package-manager/package-json.js';

export enum PackageManagerKind {
	PNPM = 'pnpm',
	YARN = 'yarn',
	NPM = 'npm',
}

export enum ProjectManagerKind {
	None = 'none',
	Rush = 'rush',
	NxJs = 'nx',
	Lerna = 'lerna',
}

export enum WorkspaceKind {
	SimplePackage = 0,
	PnpmWorkspace = 1,
	// YarnWorkspace
	// NpmWorkspace
	RushStack = 2,
}

export interface IPackageInfo {
	name: string;
	absolute: string;
	relative: string;
	/** 仅有工作区依赖，不包devDependencies */
	dependencies: string[];
	/** 仅有工作区依赖，包含所有dependencies */
	devDependencies: string[];
	packageJson: IPackageJson;
}

interface IToolsDef {
	name: ProjectManagerKind;
	find: string;
	temp?: string;
}

const tools: IToolsDef[] = [
	{
		find: 'rush.json',
		name: ProjectManagerKind.Rush,
		temp: 'common/temp/pack',
	},
	{
		find: 'lerna.json',
		name: ProjectManagerKind.Lerna,
	},
	{
		find: 'nx.json',
		name: ProjectManagerKind.NxJs,
	},
	{
		find: '.git',
		name: ProjectManagerKind.None,
	},
];

interface IAnalyzeResult {
	readonly root: string;
	readonly packageManagerKind: PackageManagerKind;
	readonly workspaceKind: WorkspaceKind;
	readonly projectManagerKind: ProjectManagerKind;
	readonly temp: string;
}

export async function createWorkspace(cwd = process.cwd()): Promise<IWorkspace> {
	const files = tools.map((tool) => tool.find);
	logger.debug("从'%s'查找文件: %s", cwd, files);
	const found = await findUpUntil({ from: cwd, file: files });
	if (!found) {
		throw new Error(`未找到工作空间根目录，应有.git相关文件: ${cwd}`);
	}

	logger.debug('    找到文件: %s', found);
	const projectRoot = dirname(found);
	const root = projectRoot;

	const tool = tools.find((def) => found.endsWith(def.find));
	const projectManagerKind = tool?.name ?? ProjectManagerKind.None;

	const temp = resolve(projectRoot, tool?.temp ?? '.package-tools');
	const packageManagerKind = await detectPackageManager(projectManagerKind, projectRoot);

	const workspaceKind = await detectRepoType(projectManagerKind, projectRoot);

	return new Workspace(cwd, {
		root,
		packageManagerKind,
		workspaceKind,
		projectManagerKind,
		temp,
	});
}

export type IWorkspace = Workspace;

class Workspace implements IAnalyzeResult {
	public readonly root: string;
	public readonly packageManagerKind: PackageManagerKind;
	public readonly workspaceKind: WorkspaceKind;
	public readonly projectManagerKind: ProjectManagerKind;

	/**
	 * 临时文件夹，保证在project目录内部
	 */
	public readonly temp: string;

	constructor(
		public readonly cwd: string,
		result: IAnalyzeResult,
	) {
		this.root = result.root;
		this.packageManagerKind = result.packageManagerKind;
		this.workspaceKind = result.workspaceKind;
		this.projectManagerKind = result.projectManagerKind;
		this.temp = result.temp;
	}

	public async getNearestPackage(from: string = this.cwd) {
		const pkgJsonFile = await findUpUntil({ from, top: this.root, file: 'package.json' });
		if (!pkgJsonFile) {
			throw new Error(`缺少package.json文件: ${from}`);
		}
		return dirname(pkgJsonFile);
	}

	public getNpmRCPath(name = '.npmrc') {
		if (this.projectManagerKind === ProjectManagerKind.Rush) {
			return resolve(this.root, 'common/config/rush', name);
		} else {
			return resolve(this.root, name);
		}
	}

	public async listPackages() {
		return listMonoRepoPackages(this.root, this.workspaceKind);
	}
}

async function execJson(cmds: string[], cwd: string) {
	const p = await execLazyError(cmds[0], cmds.slice(1), { cwd });
	return JSON.parse(p.stdout);
}

async function listMonoRepoPackages(projRoot: string, wokspaceKind: WorkspaceKind): Promise<IPackageInfo[]> {
	if (wokspaceKind === WorkspaceKind.SimplePackage) {
		const packageJson = await cachedPackageJson(resolve(projRoot, 'package.json'));
		return [
			{
				name: packageJson.name,
				absolute: projRoot,
				relative: '.',
				dependencies: [],
				devDependencies: [],
				packageJson,
			},
		];
	}
	if (wokspaceKind === WorkspaceKind.RushStack) {
		return listRush(projRoot);
	}
	if (wokspaceKind === WorkspaceKind.PnpmWorkspace) {
		return listPnpm(projRoot);
	}

	throw new Error('不支持的工作空间类型');
}

function filter(localNames: string[], depMap: Record<string, string>) {
	const ret: string[] = [];
	if (!depMap) {
		return ret;
	}
	for (const name of localNames) {
		const ver = depMap[name];
		if (!ver) continue;

		if (ver.startsWith('workspace:')) {
			ret.push(name);
		}
	}
	return ret;
}
function listRush(_projectRoot: string): never {
	throw new Error('Function not implemented.');
}

async function listPnpm(projectRoot: string) {
	logger.debug('使用pnpm命令列出项目');
	const ret: IPackageInfo[] = [];
	const defs = await execJson(['pnpm', 'recursive', 'ls', '--depth=-1', '--json'], projectRoot);
	const allNames = defs.map((d: any) => d.name);
	for (const { name, path } of defs) {
		const pkgFile = resolve(path, 'package.json');
		const pkg = await cachedPackageJson(pkgFile);
		const allDep = {};
		if (pkg.dependencies) {
			Object.assign(allDep, pkg.dependencies);
		}
		if (pkg.devDependencies) {
			Object.assign(allDep, pkg.devDependencies);
		}
		ret.push({
			absolute: path,
			relative: relativePath(projectRoot, path),
			name: name,
			dependencies: filter(allNames, pkg.dependencies),
			devDependencies: filter(allNames, allDep),
			packageJson: pkg,
		});
	}
	return ret;
}

async function detectPackageManager(rm: ProjectManagerKind, projectRoot: string) {
	switch (rm) {
		case ProjectManagerKind.Rush: {
			const settings = await readCommentJsonFile(resolve(projectRoot, 'rush.json'));
			if (settings.pnpmVersion) {
				return PackageManagerKind.PNPM;
			}
			if (settings.yarnVersion) {
				return PackageManagerKind.YARN;
			}
			if (settings.npmVersion) {
				return PackageManagerKind.NPM;
			}
			throw new Error('rush设置不正常，缺少包管理器版本信息');
		}
		case ProjectManagerKind.Lerna: {
			const settings = await readCommentJsonFile(resolve(projectRoot, 'lerna.json'));
			if (settings.npmClient) {
				return settings.npmClient;
			}
			throw new Error('lerna设置不正常，缺少包管理器版本信息');
		}
	}

	if (existsSync(resolve(projectRoot, 'pnpm-workspace.yaml'))) {
		return PackageManagerKind.PNPM;
	}
	if (existsSync(resolve(projectRoot, 'yarn.lock'))) {
		throw new Error('yarn not implemented');
	}
	return PackageManagerKind.NPM;
}

async function detectRepoType(rm: ProjectManagerKind, projectRoot: string) {
	if (rm === ProjectManagerKind.Rush) {
		return WorkspaceKind.RushStack;
	}

	if (await exists(resolve(projectRoot, 'pnpm-workspace.yaml'))) {
		return WorkspaceKind.PnpmWorkspace;
	}

	return WorkspaceKind.SimplePackage;
}
