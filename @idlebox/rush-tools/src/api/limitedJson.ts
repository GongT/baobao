export interface IProjectConfig {
	packageName: string;
	projectFolder: string;
	reviewCategory?: string;
	cyclicDependencyProjects?: string[];
	shouldPublish?: boolean;
	skipRushCheck?: boolean;
	versionPolicyName?: string;
}

export interface IRushConfig {
	npmVersion?: string;
	pnpmVersion?: string;
	yarnVersion?: string;
	rushVersion: string;
	projects: IProjectConfig[];
}
