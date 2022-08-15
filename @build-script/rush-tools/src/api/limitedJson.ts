import type { DeepReadonly } from '@idlebox/common';

export interface IProjectConfig {
	packageName: string;
	projectFolder: string;
	reviewCategory?: string;
	cyclicDependencyProjects?: string[];
	shouldPublish?: boolean;
	skipRushCheck?: boolean;
	versionPolicyName?: string;
}

export type ICProjectConfig = DeepReadonly<IProjectConfig>;
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
