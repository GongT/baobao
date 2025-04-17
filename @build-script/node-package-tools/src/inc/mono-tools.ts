import type { IPackageJson } from '@idlebox/common';
import { execLazyError, exists, findUpUntil, relativePath } from '@idlebox/node';
import { readCommentJsonFile } from '@idlebox/node-json-edit';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { readPackageJson } from './fs.js';
import { logger } from './log.js';

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
	PnpmWorkspace,
	// YarnWorkspace
	// NpmWorkspace
	RushStack,
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

class MonoRepo {
	private root?: string;
	private packageManagerKind?: PackageManagerKind;
	private workspaceKind?: WorkspaceKind;
	private projectManagerKind?: ProjectManagerKind;
	private nearestPackage?: string;
	private temp?: string;

	private analyzePromise?: Promise<void>;

	constructor(private cwd = process.cwd()) {}

	chdir(newCwd: string) {
		this.cwd = newCwd;
		if (this.root && !newCwd.startsWith(this.root)) {
			delete this.analyzePromise;
		}
	}

	private analyze() {
		if (!this.analyzePromise) {
			this.analyzePromise = this._analyze();
		}
		return this.analyzePromise;
	}

	private async _analyze() {
		const dir = this.cwd;

		const files = tools.map((tool) => tool.find);
		logger.debug("从'%s'查找文件: %s", dir, files);
		const found = await findUpUntil({ from: dir, file: files });
		if (!found) {
			throw new Error('未找到工作空间根目录，应有.git相关文件: ' + dir);
		}

		logger.debug('找到文件: %s', found);
		const projectRoot = dirname(found);
		this.root = projectRoot;

		const tool = tools.find((def) => found.endsWith(def.find));
		this.projectManagerKind = tool?.name ?? ProjectManagerKind.None;

		this.temp = resolve(projectRoot, tool?.temp ?? '.node-package-tools');
		this.packageManagerKind = await detectPackageManager(this.projectManagerKind, projectRoot);

		this.workspaceKind = await detectRepoType(this.projectManagerKind, projectRoot);

		const pkgJsonFile = await findUpUntil({ from: dir, file: 'package.json' });
		if (!pkgJsonFile) {
			throw new Error('缺少package.json文件: ' + dir);
		}
		this.nearestPackage = dirname(pkgJsonFile);
	}

	async getWorkspaceKind() {
		await this.analyze();
		return this.workspaceKind;
	}

	async getRoot() {
		await this.analyze();
		return this.root!;
	}
	async getPackageManager() {
		await this.analyze();
		return this.packageManagerKind!;
	}
	async getRepoManager() {
		await this.analyze();
		return this.projectManagerKind!;
	}
	async getNearestPackage() {
		await this.analyze();
		return this.nearestPackage!;
	}
	async getTempFolder() {
		await this.analyze();
		return this.temp!;
	}
}

export const monorepo = new MonoRepo();

async function execJson(cmds: string[], cwd: string) {
	const p = await execLazyError(cmds[0], cmds.slice(1), { cwd });
	return JSON.parse(p.stdout);
}

export interface IPackageInfo {
	name: string;
	absolute: string;
	relative: string;
	dependencies: string[];
	packageJson: IPackageJson;
}
export async function listMonoRepoPackages(from: string = process.cwd()) {
	monorepo.chdir(from);
	const projRoot = await monorepo.getRoot();
	const wokspaceKind = await monorepo.getWorkspaceKind();
	if (wokspaceKind === WorkspaceKind.SimplePackage) {
		const packageJson = await readPackageJson(resolve(projRoot, 'package.json'));
		return [
			{
				name: packageJson.name,
				absolute: projRoot,
				relative: '.',
				dependencies: [],
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

	throw new Error(`不支持的工作空间类型`);
}

function filter(localNames: string[], depMap: Record<string, string>) {
	const ret: string[] = [];
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
		const pkg = await readPackageJson(pkgFile);
		ret.push({
			absolute: path,
			relative: relativePath(projectRoot, path),
			name: name,
			dependencies: filter(allNames, pkg.dependencies || {}),
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
