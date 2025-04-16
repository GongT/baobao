import { execLazyError, findUpUntil, osTempDir, relativePath } from '@idlebox/node';
import { readCommentJsonFile } from '@idlebox/node-json-edit';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { debug } from './log.js';

export enum PackageManager {
	PNPM = 'pnpm',
	YARN = 'yarn',
	NPM = 'npm',
}

export enum ToolKind {
	None,
	Rush,
	NxJs,
	Lerna,
}

interface IToolsDef {
	name: ToolKind;
	find: string;
	temp: string;
}

const tools: IToolsDef[] = [
	{
		find: 'rush.json',
		name: ToolKind.Rush,
		temp: 'common/temp/pack',
	},
	{
		find: 'lerna.json',
		name: ToolKind.Lerna,
		temp: '.nx/node-package-tools',
	},
	{
		find: 'nx.json',
		name: ToolKind.NxJs,
		temp: '.nx/node-package-tools',
	},
	{
		find: '.git',
		name: ToolKind.None,
		temp: osTempDir('node-package-tools'),
	},
];

interface IPaths {
	tool: IToolsDef;
	projectRoot: string;
	packageRoot: string;
	tempFolder: string;
	packageManager: PackageManager;
}

let findCache = new Map<string, IPaths>();
async function getTool(dir: string) {
	let data = findCache.get(dir);
	if (data !== undefined) {
		return data;
	}

	const files = tools.map((tool) => tool.find);
	debug("从'%s'查找文件: %s", dir, files);
	const found = await findUpUntil({ from: dir, file: files });
	if (!found) {
		throw new Error('未找到工作空间根目录，应有.git相关文件: ' + dir);
	}

	debug('找到文件: %s', found);

	const projectRoot = dirname(found);
	const ffile = basename(found);
	const tindex = tools.findIndex((def) => def.find === ffile);

	if (tindex < 0) {
		throw new Error('不可能的错误');
	}

	const pkgJsonFile = await findUpUntil({ from: dir, file: 'package.json' });
	if (!pkgJsonFile) {
		throw new Error('缺少package.json文件: ' + dir);
	}

	data = {
		tool: tools[tindex],
		projectRoot: projectRoot,
		packageRoot: dirname(pkgJsonFile),
		tempFolder: resolve(projectRoot, tools[tindex].temp),
		packageManager: await detectPackageManager(tools[tindex].name, projectRoot),
	};

	findCache.set(dir, data);

	return data;
}

export async function getTempFolder(from: string = process.cwd()) {
	const info = await getTool(from);
	return info.tempFolder;
}

export async function getProjectRoot(from: string = process.cwd()) {
	const info = await getTool(from);
	return info.projectRoot;
}

async function execJson(cmds: string[], cwd: string) {
	const p = await execLazyError(cmds[0], cmds.slice(1), { cwd });
	return JSON.parse(p.stdout);
}

export interface IPackageInfo {
	name: string;
	absolute: string;
	relative: string;
	dependencies: string[];
	devDependencies: string[];
}
export async function listMonoRepoPackages(from: string = process.cwd()) {
	const info = await getTool(from);

	switch (info.tool.name) {
		case ToolKind.Rush:
			return listRush(info);
		case ToolKind.Lerna:
			if (info.packageManager === PackageManager.PNPM) {
				return listPnpm(info);
			}
			return listLerna(info);
		// case ToolKind.NxJs:
		// 	return listNx(info);
		default:
			if (info.packageManager === PackageManager.PNPM) {
				return listPnpm(info);
			}
			throw new Error(`不支持的工具和包管理器: ${info.tool.name} | ${info.packageManager}`);
	}
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
function listRush(_info: IPaths): never {
	throw new Error('Function not implemented.');
}

async function listPnpm(info: IPaths, location: string = info.projectRoot) {
	debug('使用pnpm命令列出项目');
	const ret: IPackageInfo[] = [];
	const defs = await execJson(['pnpm', 'recursive', 'ls', '--depth=-1', '--json'], location);
	const allNames = defs.map((d: any) => d.name);
	for (const { name, path } of defs) {
		const pkgFile = resolve(path, 'package.json');
		const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
		ret.push({
			absolute: path,
			relative: relativePath(info.projectRoot, path),
			name: name,
			dependencies: filter(allNames, pkg.dependencies || {}),
			devDependencies: filter(allNames, pkg.devDependencies || {}),
		});
	}
	return ret;
}

async function listLerna(info: IPaths) {
	debug('使用lerna命令列出项目');
	const ret: IPackageInfo[] = [];
	const p = await execLazyError('lerna', ['list', '--json'], { cwd: info.projectRoot });
	const defs = JSON.parse(p.stdout);
	const allNames = defs.map((d: any) => d.name);
	for (const { name, location } of defs) {
		const pkgFile = resolve(location, 'package.json');
		const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
		ret.push({
			absolute: location,
			relative: relativePath(info.projectRoot, location),
			name: name,
			dependencies: filter(allNames, pkg.dependencies || {}),
			devDependencies: filter(allNames, pkg.devDependencies || {}),
		});
	}
	return ret;
}

// function listNx(info: IPaths) {
// 	debug('使用nx命令列出项目');
// 	const names: string[] = JSON.parse(
// 		execaSync('nx', ['show', 'projects', '--json'], { stdio: 'pipe', cwd: info.projectRoot }).stdout
// 	);
// 	const ret: IPackageInfo[] = [];
// 	for (const name of names) {
// 		const data = JSON.parse(
// 			execaSync('nx', ['show', 'project', name, '--json'], { stdio: 'pipe', cwd: info.projectRoot }).stdout
// 		);
// 		const location = resolve(info.projectRoot, data.root);
// 		const pkgFile = resolve(location, 'package.json');
// 		const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
// 		ret.push({
// 			absolute: location,
// 			relative: data.root,
// 			name,
// 			dependencies: filter(names, pkg.dependencies || {}),
// 			devDependencies: filter(names, pkg.devDependencies || {}),
// 		});
// 	}
// 	return ret;
// }

async function detectPackageManager(name: ToolKind, projectRoot: string) {
	switch (name) {
		case ToolKind.Rush: {
			const settings = await readCommentJsonFile(resolve(projectRoot, 'rush.json'));
			if (settings.pnpmVersion) {
				return PackageManager.PNPM;
			}
			if (settings.yarnVersion) {
				return PackageManager.YARN;
			}
			if (settings.npmVersion) {
				return PackageManager.NPM;
			}
			throw new Error('rush设置不正常，缺少包管理器版本信息');
		}
		case ToolKind.Lerna: {
			const settings = await readCommentJsonFile(resolve(projectRoot, 'lerna.json'));
			if (settings.npmClient) {
				return settings.npmClient;
			}
			throw new Error('lerna设置不正常，缺少包管理器版本信息');
		}
	}

	if (existsSync(resolve(projectRoot, 'pnpm-workspace.yaml'))) {
		return PackageManager.PNPM;
	}
	if (existsSync(resolve(projectRoot, 'yarn.lock'))) {
		throw new Error('yarn not implemented');
	}
	return PackageManager.NPM;
}
