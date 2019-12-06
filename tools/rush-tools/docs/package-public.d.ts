
export declare function clearCache(): void;

export declare function eachProject(): IProjectConfig[];

export declare function getCurrentRushConfig(): any;

export declare function getCurrentRushConfigPath(): string;

export declare function getCurrentRushRootPath(): string;

export declare interface IProjectConfig {
    packageName: string;
    projectFolder: string;
    reviewCategory?: string;
    cyclicDependencyProjects?: string[];
    shouldPublish?: boolean;
    skipRushCheck?: boolean;
    versionPolicyName?: string;
}

export declare function toProjectPathAbsolute(projectFolder: string): string;

export declare function toProjectPathRelative(projectFolder: string): string;

export { }
