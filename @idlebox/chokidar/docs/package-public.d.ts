import { FSWatcher } from 'chokidar';

export { FSWatcher }

declare interface IReloadFunction {
    (changes: string[]): void | Promise<void>;
}

export declare interface IWatchHelper {
    addWatch(newWatch: string): void;
    delWatch(oldWatch: string): void;
    reset(): void;
    dispose(): Promise<void>;
    readonly watches: ReadonlyArray<string>;
}

export declare function startChokidar(reload: IReloadFunction): IWatchHelper;

export declare class WatchHelper implements IWatchHelper {
    private readonly watcher;
    private readonly onChange;
    private _watches;
    private state;
    debounceMs: number;
    private lastRun?;
    private changes;
    constructor(watcher: FSWatcher, onChange: IReloadFunction);
    private _debounce?;
    private debounce;
    private changeState;
    private handleChange;
    private realTrigger;
    addWatch(newWatch: string): void;
    delWatch(oldWatch: string): void;
    reset(): void;
    get watches(): ReadonlyArray<string>;
    dispose(): Promise<void>;
}

export { }
