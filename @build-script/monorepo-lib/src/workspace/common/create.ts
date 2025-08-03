import { NotImplementedError, type IPackageJson } from '@idlebox/common';
import { exists, findUpUntil } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { findMonorepoRoot } from '../../common/find-root.js';
import { getLernaPackageManager } from '../drivers/lerna-nx.js';
import { getRushPackageManager } from '../drivers/rush.js';
import { MonorepoWorkspace, SimplePackage, type WorkspaceBase } from '../index.js';
import { PackageManagerKind, WorkspaceKind } from './types.js';

export class NotMonorepo extends Error {}

export async function createWorkspaceOrPackage(cwd = process.cwd()): Promise<WorkspaceBase> {
	try {
		return await createWorkspace(cwd);
	} catch (e) {
		if (e instanceof NotMonorepo) {
			return await createSimpleProject(cwd);
		}
		throw e;
	}
}

export async function createSimpleProject(cwd = process.cwd()) {
	const file = await findUpUntil({ file: 'package.json', from: cwd });
	if (!file) {
		throw new Error('missing package.json');
	}
	const root = dirname(file);
	let pm: PackageManagerKind = PackageManagerKind.Unknown;
	const pkgJson: IPackageJson = await import(file, { with: { type: 'json' } });
	if (typeof pkgJson.packageManager === 'string') {
		const name = pkgJson.packageManager.split('@')[0];
		if (name === 'pnpm') {
			pm = PackageManagerKind.PNPM;
		} else if (name === 'yarn') {
			pm = PackageManagerKind.YARN;
		} else if (name === 'npm') {
			pm = PackageManagerKind.NPM;
		}
	}

	if (pm === PackageManagerKind.Unknown) {
		if (existsSync(resolve(root, 'pnpm-lock.yaml'))) {
			pm = PackageManagerKind.PNPM;
		} else if (existsSync(resolve(root, 'yarn.lock'))) {
			pm = PackageManagerKind.YARN;
		} else if (existsSync(resolve(root, 'package-lock.json'))) {
			pm = PackageManagerKind.NPM;
		}
	}

	return new SimplePackage({
		root: root,
		packageManagerKind: pm,
		temp: resolve(dirname(file), '.package-tools'),
	});
}

export async function createWorkspace(cwd = process.cwd()): Promise<MonorepoWorkspace> {
	const file = await findMonorepoRoot(cwd);

	if (!file) {
		throw new NotMonorepo(`failed find any workspace (search from: ${cwd})`);
	}

	const projectRoot = dirname(file);

	let temp = '.package-tools';
	let packageManagerKind = PackageManagerKind.Unknown;
	let workspaceKind = WorkspaceKind.Unknown;

	switch (basename(file)) {
		case 'pnpm-workspace.yaml':
			packageManagerKind = PackageManagerKind.PNPM;
			workspaceKind = WorkspaceKind.PnpmWorkspace;
			break;
		case 'rush.json':
			workspaceKind = WorkspaceKind.RushStack;
			temp = 'common/temp/package-tools';
			packageManagerKind = await getRushPackageManager(projectRoot);
			break;
		case 'lerna.json':
			workspaceKind = WorkspaceKind.Lerna;
			packageManagerKind = await getLernaPackageManager(projectRoot);
			break;
		case 'nx.json':
			workspaceKind = WorkspaceKind.NxJs;
			packageManagerKind = await getLernaPackageManager(projectRoot);
			break;
		case 'package.json':
			if (await exists(`${projectRoot}/yarn.lock`)) {
				workspaceKind = WorkspaceKind.YarnWorkspace;
				packageManagerKind = PackageManagerKind.YARN;
			} else if (await exists(`${projectRoot}/package-lock.json`)) {
				workspaceKind = WorkspaceKind.NpmWorkspace;
				packageManagerKind = PackageManagerKind.NPM;
			} else {
				throw new Error('lock file not exists inside workspaces (yarn.lock or package-lock.json)');
			}
			break;
		default:
			throw new NotImplementedError(`Not implement: ${basename(file, '.json')} 的支持`);
	}

	return new MonorepoWorkspace({
		root: projectRoot,
		packageManagerKind,
		workspaceKind,
		temp: resolve(projectRoot, temp),
	});
}
