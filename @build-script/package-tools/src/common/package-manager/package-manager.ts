import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { logger as defaultLogger, type IMyLogger } from '@idlebox/cli';
import { commandInPath, PathEnvironment } from '@idlebox/node';
import type { PackageManager, PackageManagerUsageKind } from './driver.abstract.js';
import { NPM } from './driver.npm.js';
import { PNPM } from './driver.pnpm.js';
import { reconfigureProxyWithNpmrc } from './proxy.js';

export type IPackageManager = PackageManager;

type PackageManagerConstructor = new (usage: PackageManagerUsageKind, workspace: WorkspaceBase, subdir?: string, logger?: IMyLogger) => IPackageManager;

let pmCls: PackageManagerConstructor | undefined;

export async function createPackageManager(
	usage: PackageManagerUsageKind,
	workspace: WorkspaceBase,
	subdir?: string,
	logger: IMyLogger = defaultLogger,
): Promise<IPackageManager> {
	if (pmCls) {
		return new pmCls(usage, workspace, subdir, logger);
	}

	const supports: Record<string, PackageManagerConstructor> = { pnpm: PNPM, npm: NPM };
	for (const [name, Cls] of Object.entries(supports)) {
		if (!(await commandInPath(name).catch(() => false))) {
			continue;
		}

		const pm = new Cls(usage, workspace, subdir, logger);

		await reconfigureProxyWithNpmrc(pm);

		pmCls = Cls;
		return pm;
	}

	const pathVar = new PathEnvironment();
	console.log(`当前PATH: (${process.env.PATH})\n  - ${[...pathVar.values()].join('\n  - ')}`);
	throw new Error(`未检测到任何包管理器，请在PATH中安装${Object.keys(supports).join('、')}`);
}
