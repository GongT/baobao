import { CancellationToken } from 'vscode';
import { CancellationTokenSource } from 'vscode';
import { ExtensionContext } from 'vscode';
import { Memento } from 'vscode';

export declare abstract class Action<T> implements IAction<T> {
    protected readonly cancelSource: CancellationTokenSource;
    protected readonly cancel: CancellationToken;
    constructor();
    protected selfCancel(): void;
    dispose(): void;
    abstract run(...args: any[]): Promise<T>;
}

export declare abstract class BaseLogger implements ILogger {
    protected constructor(register?: boolean);
    protected abstract appendLine(line: string): void;
    abstract dispose(): void | Promise<void>;
    protected format(tag: string, args: any[]): string;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
    emptyline(): void;
}

export declare const context: ExtensionContext & MyExtend;

export declare class ExtensionFileSystem {
    private context;
    private constructor();
    createLog(name: string): Promise<void>;
    getAsset(file: string): FileContext;
    getGlobal(file: string): FileContext;
    getWorkspace(file: string): FileContext;
}

export declare enum ExtensionState {
    BEFORE_INIT = 0,
    INIT = 1,
    NORMAL = 2,
    DEINIT = 3,
    EXIT = 4
}

export declare let extensionState: ExtensionState;

export declare class ExtensionStorage {
    readonly workspace: Memento;
    readonly global: Memento;
    private constructor();
}

export declare const extFs: ExtensionFileSystem;

export declare const extStor: ExtensionStorage;

declare class FileContext {
    private readonly fPath;
    constructor(fPath: string);
    get path(): string;
    normalFile(): Promise<void>;
    isFileExists(): Promise<boolean>;
    readText(): Promise<string>;
    readJson(): Promise<any>;
    writeText(data: string): Promise<boolean>;
    writeTextForce(data: string): Promise<void>;
    writeJson(data: any): Promise<boolean>;
    writeJsonForce(data: any): Promise<void>;
    createDirectory(): Promise<void>;
    remove(): Promise<boolean>;
}

export declare function getPackageJson(): IPackageJson;

export declare interface IAction<T = void> {
    run(...args: any[]): Promise<T> | T;
    dispose(): void;
}

export declare interface IActionConstructor<T = void> {
    readonly id: string;
    readonly label: string;
    readonly icon?: ICommandIcon;
    readonly category?: string;
    new (): IAction<T>;
}

declare interface IActivateFunction {
    (context: ExtensionContext): void | Promise<void>;
}

export declare interface ICommandIcon {
    light?: string;
    dark?: string;
}

export declare interface IContributeCommand {
    command: string;
    title: string;
    category?: string;
    icon?: ICommandIcon;
}

export declare enum IdCategory {
    Action = "action",
    Setting = "setting"
}

declare interface IDeactivateFunction {
    (): void | Promise<void>;
}

export declare interface ILogger {
    log(msg: any, ...args: any[]): void;
    info(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;
    emptyline(): void;
}

export declare interface IPackageJson {
    name: string;
    version: string;
    publisher: string;
    contributes?: {
        commands?: IContributeCommand[];
    };
}

export declare const logger: VSCodeChannelLogger;

export declare interface MyExtend {
    isDevelopment: boolean;
    extensionName: {
        id: string;
        display: string;
    };
}

export declare function onExtensionActivate(fn: IActivateFunction): void;

export declare function registerAction<T>(actionCtor: IActionConstructor<T>, exposed?: boolean): void;

export declare function runMyAction<T>(Act: IActionConstructor<T>, args?: any[]): Promise<T>;

export declare abstract class SingleInstanceAction<T> extends Action<T> {
    private static lastRun;
    run(...args: any[]): Promise<T>;
    static wait(): Promise<any>;
    abstract _run(...args: any[]): Promise<T>;
}

export declare class VSCodeChannelLogger extends BaseLogger {
    private output;
    constructor(title: string);
    dispose(): void;
    protected appendLine(line: string): void;
    show(): void;
}

export declare function vscodeExtensionActivate(activate: IActivateFunction): IActivateFunction;

export declare function vscodeExtensionDeactivate(deactivate: IDeactivateFunction): IDeactivateFunction;

export declare class VSCodeFileLogger extends BaseLogger {
    private stream;
    private constructor();
    protected appendLine(line: string): void;
    dispose(): void | Promise<void>;
}

export declare function wrapId(category: IdCategory, short: string): string;

export { }
