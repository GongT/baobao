import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { commandInPath, PathEnvironment } from '@idlebox/node';
import type { PackageManager, PackageManagerUsageKind } from './driver.abstract.js';
import { NPM } from './driver.npm.js';
import { PNPM } from './driver.pnpm.js';
import { reconfigureProxyWithNpmrc } from './proxy.js';

export type IPackageManager = PackageManager;

type PackageManagerConstructor = new (usage: PackageManagerUsageKind, workspace: WorkspaceBase, subdir?: string) => IPackageManager;

let pmCls: PackageManagerConstructor | undefined;

export async function createPackageManager(usage: PackageManagerUsageKind, workspace: WorkspaceBase, subdir?: string): Promise<IPackageManager> {
	if (pmCls) {
		return new pmCls(usage, workspace, subdir);
	}

	const supports: Record<string, PackageManagerConstructor> = { pnpm: PNPM, npm: NPM };
	for (const [name, Cls] of Object.entries(supports)) {
		if (!(await commandInPath(name).catch(() => false))) {
			continue;
		}

		const pm = new Cls(usage, workspace, subdir);

		await reconfigureProxyWithNpmrc(pm);

		pmCls = Cls;
		return pm;
	}

	const pathVar = new PathEnvironment();
	console.log(`当前PATH: (${process.env.PATH})\n  - ${[...pathVar.values()].join('\n  - ')}`);
	throw new Error(`未检测到任何包管理器，请在PATH中安装${Object.keys(supports).join('、')}`);
}
