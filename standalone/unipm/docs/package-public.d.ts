import * as execa from 'execa';

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
    abstract readonly type: PackageManagerType;
    protected abstract readonly cliName: string;
    protected abstract readonly packageName: string;
    protected abstract readonly installCommand: string;
    protected abstract readonly installDevFlag: string;
    protected abstract readonly uninstallCommand: string;
    protected readonly runCommand: string;
    protected readonly initCommand: string;
    protected readonly showCommand: string;
    protected abstract readonly syncCommand: string;
    /** if set to true, debug info will print to stderr, default is process.stderr.isTTY */
    displayBeforeCommandRun: boolean;
    /** detect if this package manager is used by current project */
    detect(): Promise<boolean>;
    protected abstract _detect(): Promise<boolean>;
    constructor(cwd: string);
    protected _detectFile(file: string): Promise<boolean>;
    /** spawn package manager binary, with inherit stdio */
    invokeCli(cmd: string, ...args: string[]): Promise<void>;
    protected _invoke(cmd: string, args: string[], spawnOptions?: execa.Options): Promise<void>;
    /** run scripts in package.json, by package manager */
    run(script: string, ...args: string[]): Promise<void>;
    /** install packages
     *    * add packages into package.json
     *    * if "-d" or "--dev" in `packages`, add them to devDependencies
     **/
    install(...packages: string[]): Promise<void>;
    uninstall(...packages: string[]): Promise<void>;
    /** run package init command, normally this will create a new package.json, and maybe ask some questions */
    init(...args: string[]): Promise<void>;
    /** detect this package manager callable (installed and in PATH) */
    exists(): Promise<string | undefined>;
    /** sync package.json to node_modules, eg: npm i */
    sync(...args: string[]): Promise<void>;
    /** show package info from NPM registry */
    show(...args: string[]): Promise<void>;
}

export declare interface PackageManagerConstructor {
    new (cwd: string): PackageManager;
}

export declare enum PackageManagerType {
    NPM = 0,
    PNPM = 1,
    RUSH = 2,
    YARN = 3
}

export declare function resolveLatestVersionOnNpm(packageName: string): Promise<string>;

export { }
