
export declare function getPackageManager(_options?: Partial<IGetPackageManagerOptions>): Promise<PackageManager>;

export declare function getPackageManagerByName(name: string): PackageManagerConstructor | undefined;

export declare interface IGetPackageManagerOptions {
    cwd: string;
    default: 'npm' | 'yarn' | 'rush' | 'cnpm' | 'auto';
    ask: boolean;
}

export declare const KNOWN_PACKAGE_MANAGERS: PackageManagerConstructor[];

export declare abstract class PackageManager {
    protected readonly cwd: string;
    abstract readonly friendlyName: string;
    protected abstract readonly cliName: string;
    protected abstract readonly packageName: string;
    protected abstract readonly installCommand: string;
    protected abstract readonly installDevFlag: string;
    protected abstract readonly uninstallCommand: string;
    protected readonly runCommand: string;
    protected readonly initCommand: string;
    protected readonly showCommand: string;
    protected abstract readonly syncCommand: string;
    detect(): Promise<boolean>;
    protected abstract _detect(): Promise<boolean>;
    constructor(cwd: string);
    protected _detectFile(file: string): Promise<boolean>;
    invokeCli(cmd: string, ...args: string[]): Promise<void>;
    protected _invoke(cmd: string, args: string[]): Promise<void>;
    run(script: string, ...args: string[]): Promise<void>;
    install(...packages: string[]): Promise<void>;
    uninstall(...packages: string[]): Promise<void>;
    init(...args: string[]): Promise<void>;
    exists(): Promise<string | undefined>;
    sync(...args: string[]): Promise<void>;
    show(...args: string[]): Promise<void>;
}

export declare interface PackageManagerConstructor {
    new (cwd: string): PackageManager;
}

export declare function resolveLatestVersionOnNpm(packageName: string): Promise<string>;

export { }
