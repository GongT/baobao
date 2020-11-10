/// <reference types="node" />
import { CancellationToken } from 'vscode';
import { CancellationTokenSource } from 'vscode';
import { ExtensionContext } from 'vscode';
import { FileStat } from 'vscode';
import { FileSystem } from 'vscode';
import { FileType } from 'vscode';
import { inspect } from 'util';
import { Memento } from 'vscode';
import { Uri } from 'vscode';
import { WorkspaceFolder } from 'vscode';

export declare abstract class Action<T> implements IAction<T> {
    protected readonly cancelSource: CancellationTokenSource;
    protected readonly cancel: CancellationToken;
    constructor();
    protected selfCancel(): void;
    dispose(): void;
    abstract run(...args: any[]): Promise<T>;
}

export declare abstract class BaseLogger implements ILogger {
    private prefix;
    private prefixSkipTag;
    protected constructor(register?: boolean);
    indent(): void;
    dedent(): void;
    protected abstract appendLine(line: string): void;
    abstract dispose(): void | Promise<void>;
    protected format(tag: string, args: any[]): string;
    dir(obj: any, options?: any): void;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
    trace(...args: any[]): void;
    emptyline(): void;
}

export declare const context: ExtensionContext & MyExtend;

declare class ExtensionFileSystem {
    fs: FileSystem;
    createLog(name: string): Promise<void>;
    getAsset(file: string): FileContext;
    privateFileGlobal(file: string): FileContext;
    privateFile(file: string): FileContext;
    absoluteFile(baseUri: Uri, file: string): FileContext;
    workspaceFile(workspace: WorkspaceFolder, file: string): FileContext;
    stat(uri: Uri): Promise<FileStat>;
    readDirectory(uri: Uri): Promise<[
        string,
        FileType
    ][]>;
    createDirectory(uri: Uri): Promise<void>;
    readFileRaw(uri: Uri): Promise<Uint8Array>;
    readFile(uri: Uri, encoding?: null): Promise<Buffer>;
    readFile(uri: Uri, encoding: BufferEncoding): Promise<string>;
    writeFileRaw(uri: Uri, content: Uint8Array): Promise<void>;
    writeFile(uri: Uri, content: ArrayBufferView, encoding?: null): Promise<void>;
    writeFile(uri: Uri, content: string, encoding: BufferEncoding): Promise<void>;
    delete(uri: Uri, options?: {
        recursive?: boolean;
        useTrash?: boolean;
    }): Promise<void>;
    rename(source: Uri, target: Uri, options?: {
        overwrite?: boolean;
    }): Promise<void>;
    copy(source: Uri, target: Uri, options?: {
        overwrite?: boolean;
    }): Promise<void>;
    exists(uri: Uri): Promise<boolean>;
    lexists(uri: Uri): Promise<boolean>;
    isFile(uri: Uri): Promise<number | false>;
    isDir(uri: Uri): Promise<number | false>;
    isSymlink(uri: Uri): Promise<number | false>;
}

export declare enum ExtensionState {
    BEFORE_INIT = 0,
    INIT = 1,
    NORMAL = 2,
    DEINIT = 3,
    EXIT = 4
}

export declare let extensionState: ExtensionState;

declare class ExtensionStorage {
    readonly workspace: Memento;
    readonly global: Memento;
}

declare class FileContext {
    private readonly fs;
    private readonly fPath;
    constructor(fs: ExtensionFileSystem, fPath: Uri);
    get path(): Uri;
    toString(): string;
    [inspect.custom](): string;
    resolve(...subPath: string[]): FileContext;
    asNormalFile(): Promise<this>;
    asDirectory(): Promise<this>;
    isFileExists(): Promise<number | false>;
    readText(): Promise<string>;
    /**
     * @param comments Allow comment in json
     * @throws when read failed or json parse error
     */
    readJson(comments?: boolean): Promise<any>;
    writeText(data: string): Promise<boolean>;
    writeTextForce(data: string): Promise<void>;
    writeJson(data: any): Promise<boolean>;
    writeJsonForce(data: any): Promise<void>;
    delete(): Promise<boolean>;
}

export declare const filesystem: ExtensionFileSystem;

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
    (context: ExtensionContext): Promise<any>;
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

export declare interface IContributeKeybinding {
    command: string;
    key: string;
    when?: string;
}

export declare enum IdCategory {
    Action = "action",
    Setting = "setting"
}

declare interface IDeactivateFunction {
    (): void | Promise<void>;
}

export declare interface ILogger {
    dir(obj: any, options?: any): void;
    log(msg: any, ...args: any[]): void;
    info(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;
    trace(msg: any, ...args: any[]): void;
    emptyline(): void;
}

export declare interface IPackageJson {
    name: string;
    version: string;
    publisher: string;
    contributes?: {
        commands?: IContributeCommand[];
        keybindings?: IContributeKeybinding[];
    };
}

export declare const logger: VSCodeChannelLogger;

export declare interface MyExtend {
    isDevelopment: boolean;
    extensionName: string;
    extensionId: string;
}

export declare function onExtensionActivate(fn: IActivateFunction): void;

export declare function registerAction<T>(actionCtor: IActionConstructor<T>, exposed?: boolean): void;

export declare function replaceConsole(_logger?: VSCodeChannelLogger): Console;

export declare function runMyAction<T>(Act: IActionConstructor<T>, args?: any[]): Promise<T>;

export declare abstract class SingleInstanceAction<T> extends Action<T> {
    private static lastRun;
    run(...args: any[]): Promise<T>;
    static wait(): Promise<any>;
    abstract _run(...args: any[]): Promise<T>;
}

export declare const storage: ExtensionStorage;

export declare class VSCodeChannelLogger extends BaseLogger {
    private output;
    constructor(title: string);
    dispose(): void;
    clear(): void;
    appendLine(line: string): void;
    append(text: string): void;
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
