
export declare function buildProjects(builder: IProjectCallback, path?: string): Promise<void>;

export declare function description(func: any): string;

export declare function description(func: any, desc: string): void;

export declare function eachProject(fromPath?: string): IProjectConfig[];

export declare function findRushJson(fromPath?: string): Promise<string | null>;

export declare function findRushJsonSync(fromPath?: string): string | null;

export declare function findRushRootPath(fromPath?: string): Promise<string | null>;

export declare function findRushRootPathSync(fromPath?: string): string | null;

export declare interface IJob<T> {
    (arg: T): Promise<void>;
}

export declare type Immutable<T> = T extends ImmutablePrimitive ? T : T extends Array<infer U> ? ImmutableArray<U> : T extends Map<infer K, infer V> ? ImmutableMap<K, V> : T extends Set<infer M> ? ImmutableSet<M> : ImmutableObject<T>;

export declare type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;

export declare type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;

export declare type ImmutableObject<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
};

declare type ImmutablePrimitive = undefined | null | boolean | string | number | Function;

export declare type ImmutableSet<T> = ReadonlySet<Immutable<T>>;

export declare interface IProjectCallback {
    (project: Immutable<IProjectConfig>): Promise<void>;
}

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
    removeCyclic?: boolean;
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

export declare function main(): Promise<void>;

export declare class NormalError extends Error {
}

export declare function runAutoFix(): Promise<void>;

export declare function runForEach(argv: string[]): Promise<void>;

export declare function runList(argv: string[]): Promise<void>;

export declare class RunQueue<T> {
    private readonly job;
    private readonly concurrent;
    private readonly items;
    constructor(job: IJob<T>, concurrent?: number);
    register(id: string, arg: T, deps: ReadonlyArray<string>): void;
    run(): Promise<void>;
}

export declare function runRegisterProject(): Promise<void>;

export declare class RushProject {
    readonly configFile: string;
    readonly projectRoot: string;
    readonly config: Immutable<IRushConfig>;
    private _preferredVersions;
    constructor(path?: string);
    get preferredVersions(): {
        [id: string]: string;
    };
    get projects(): Immutable<IProjectConfig[]>;
    absolute(project: Immutable<IProjectConfig> | string, ...segments: string[]): string;
    getPackageByName(name: string): Immutable<IProjectConfig> | null;
    packageJsonPath(project: Immutable<IProjectConfig> | string): string | null;
    packageDependency(project: Immutable<IProjectConfig> | string, { removeCyclic, development }?: IProjectDependencyOptions): string[];
}

export { }
