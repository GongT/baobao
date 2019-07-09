import { getCurrentRushConfig } from './load';

export interface IProjectConfig {
	packageName: string;
	projectFolder: string;
	reviewCategory?: string;
	cyclicDependencyProjects?: string[];
	shouldPublish?: boolean;
	skipRushCheck?: boolean;
	versionPolicyName?: string;
}

export function eachProject(): IProjectConfig[] {
	return getCurrentRushConfig().projects;
}
