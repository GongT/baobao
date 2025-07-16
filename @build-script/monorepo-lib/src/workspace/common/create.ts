import { NotImplementedError } from '@idlebox/common';
import { exists } from '@idlebox/node';
import { basename, dirname, resolve } from 'node:path';
import { findMonorepoRoot } from '../../common/find-root.js';
import { getLernaPackageManager } from '../drivers/lerna-nx.js';
import { getRushPackageManager } from '../drivers/rush.js';
import { MonorepoWorkspace } from '../index.js';
import { PackageManagerKind, WorkspaceKind } from './types.js';

export async function createWorkspace(cwd = process.cwd()): Promise<MonorepoWorkspace> {
	const file = await findMonorepoRoot(cwd);

	if (!file) {
		throw new Error(`failed find any workspace (search from: ${cwd})`);
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
			if (await exists(projectRoot + '/yarn.lock')) {
				workspaceKind = WorkspaceKind.YarnWorkspace;
				packageManagerKind = PackageManagerKind.YARN;
			} else if (await exists(projectRoot + '/package-lock.json')) {
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
