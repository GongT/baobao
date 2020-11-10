import sqlite3 from 'vscode-sqlite3';

export declare type GetFnType = (sql: string, params: any, callback?: (this: sqlite3.Statement, err: Error | null, row: any) => void) => any;

declare interface ICallback<T> {
    (client: sqlite3.Database): T;
}

export declare function withDatabase<T>(dbPath: string, callback: ICallback<T | Promise<T>>): Promise<T>;

export { }
