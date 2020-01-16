
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

export declare function main(): Promise<void>;

export declare class NormalError extends Error {
}

export declare function resolveRushProjectBuildOrder(path?: string): IProjectConfig[][];

export declare function runAutoFix(): Promise<void>;

export declare function runForEach(argv: string[]): Promise<void>;

export declare function runList(argv: string[]): Promise<void>;

export declare function runRegisterProject(): Promise<void>;

export declare function toProjectPathAbsolute(projectFolder: string): string;

export declare function toProjectPathRelative(projectFolder: string): string;

export { }
