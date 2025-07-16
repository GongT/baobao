import type { DeepReadonly, IPackageJson } from '@idlebox/common';

export enum PackageManagerKind {
	Unknown = '',
	PNPM = 'pnpm',
	YARN = 'yarn',
	NPM = 'npm',
}

export enum WorkspaceKind {
	Unknown = 0,
	PnpmWorkspace,
	YarnWorkspace,
	NpmWorkspace,
	RushStack,
	NxJs,
	Lerna,
}

export interface IPackageInfo {
	readonly name: string;
	readonly absolute: string;
	readonly relative: string;

	/** 仅有工作区(workspace:*)依赖，不包devDependencies */
	readonly dependencies: readonly string[];
	/** 仅有工作区(workspace:*)依赖，同时包含所有dependencies */
	readonly devDependencies: readonly string[];

	readonly packageJson: DeepReadonly<IPackageJson>;
}

export interface IPackageInfoRW {
	readonly name: string;
	readonly absolute: string;
	readonly relative: string;

	dependencies: string[];
	devDependencies: string[];

	readonly packageJson: DeepReadonly<IPackageJson>;
}
