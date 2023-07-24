import type { DeepReadonly } from '@idlebox/common';

export interface IProjectConfig {
	packageName: string;
	projectFolder: string;
	reviewCategory?: string;
	/** @deprecated */
	cyclicDependencyProjects?: string[];
	decoupledLocalDependencies?: string[];
	shouldPublish?: boolean;
	skipRushCheck?: boolean;
	versionPolicyName?: string;
	isAutoInstaller?: boolean;
}

export type ICProjectConfig = DeepReadonly<Omit<IProjectConfig, 'cyclicDependencyProjects'>>;
export interface IRushConfig {
	npmVersion?: string;
	pnpmVersion?: string;
	yarnVersion?: string;
	rushVersion: string;
	projects: IProjectConfig[];
	pnpmOptions?: {
		pnpmStore?: 'global' | 'local';
		strictPeerDependencies?: boolean;
		resolutionStrategy?: 'fast' | 'fewer-dependencies';
		preventManualShrinkwrapChanges?: boolean;
		useWorkspaces?: boolean;
	};
}

export interface ICRushConfig extends DeepReadonly<IRushConfig> {}
