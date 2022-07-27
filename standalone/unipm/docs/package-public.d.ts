import { ExecaChildProcess } from 'execa';
import { Options } from 'execa';

export declare function deletePackageDependency(file: string, ...deps: string[]): Promise<void>;

export declare function formatPackageJson(file: string, args: string[]): Promise<void>;

export declare function getPackageManager(_options?: Partial<IGetPackageManagerOptions>): Promise<PackageManager>;

export declare function getPackageManagerByName(name: string): PackageManagerConstructor | undefined;

export declare interface IGetPackageManagerOptions {
    cwd: string;
    packageJson?: string;
    default: 'npm' | 'yarn' | 'rush' | 'cnpm' | 'auto';
    ask: boolean;
}

export declare const KNOWN_PACKAGE_MANAGER_NAMES: string[];

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
    detect(): Promise<this | undefined>;
    protected abstract _detect(): Promise<boolean>;
    constructor(cwd: string);
    protected _detectFile(file: string): Promise<boolean>;
    /** spawn package manager binary, with inherit stdio */
    invokeCli(cmd: string, ...args: string[]): Promise<void>;
    /** spawn package manager binary, mute output */
    protected _invokeErrorLater(cmd: string, args: string[], spawnOptions?: Omit<Options, 'stdio' | 'encoding'>): Promise<void>;
    protected _invoke(cmd: string, args: string[], spawnOptions?: Options): Promise<void>;
    protected __invoke(cmd: string, args: string[], spawnOptions: Options): ExecaChildProcess<string>;
    /** run scripts in package.json, by package manager */
    run(script: string, ...args: string[]): Promise<void>;
    /** install packages
     *    * add packages into package.json
     *    * if "-D" or "--dev" in `packages`, add them to devDependencies
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

export declare function reformatPackageJson({ ...packageJson }: any): typeof packageJson;

export declare function resolveLatestVersionOnNpm(packageName: string): Promise<string>;

export declare function resortPackage(file: string): Promise<void>;

export { }
