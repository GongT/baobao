
export declare function eachProject(fromPath?: string): IProjectConfig[];

export declare function findRushJson(fromPath?: string): Promise<string | null>;

export declare function findRushJsonSync(fromPath?: string): string | null;

export declare function findRushRootPath(fromPath?: string): Promise<string | null>;

export declare function findRushRootPathSync(fromPath?: string): string | null;

export declare type Immutable<T> = T extends ImmutablePrimitive ? T : T extends Array<infer U> ? ImmutableArray<U> : T extends Map<infer K, infer V> ? ImmutableMap<K, V> : T extends Set<infer M> ? ImmutableSet<M> : ImmutableObject<T>;

export declare type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;

export declare type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;

export declare type ImmutableObject<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
};

declare type ImmutablePrimitive = undefined | null | boolean | string | number | Function;

export declare type ImmutableSet<T> = ReadonlySet<Immutable<T>>;

export declare interface IProjectConfig {
    packageName: string;
    projectFolder: string;
    reviewCategory?: string;
    cyclicDependencyProjects?: string[];
    shouldPublish?: boolean;
    skipRushCheck?: boolean;
    versionPolicyName?: string;
}

declare interface IProjectDependencyOptions {
    cyclic?: boolean;
    development?: boolean;
}

export declare interface IRushConfig {
    npmVersion?: string;
    pnpmVersion?: string;
    yarnVersion?: string;
    rushVersion: string;
    projects: IProjectConfig[];
}

export declare function loadConfig(fromPath?: string): Promise<IRushConfig | null>;

export declare function loadConfigSync(fromPath?: string): IRushConfig | null;

export declare function resolveRushProjectBuildOrder(path?: string): Immutable<IProjectConfig[]>;

export declare class RushProject {
    readonly configFile: string;
    readonly projectRoot: string;
    readonly config: Immutable<IRushConfig>;
    constructor(path?: string);
    get projects(): Immutable<IProjectConfig[]>;
    absolute(project: Immutable<IProjectConfig> | string, ...segments: string[]): string;
    getPackageByName(name: string): Immutable<IProjectConfig> | null;
    packageJsonPath(project: Immutable<IProjectConfig> | string): string | null;
    packageDependency(project: Immutable<IProjectConfig> | string, { cyclic, development }?: IProjectDependencyOptions): string[];
}

export { }
