import { ExtensionContext } from 'vscode';

declare interface IActivateFunction {
    (context: ExtensionContext): void;
}

declare interface IDeactivateFunction {
    (): void;
}

export declare let logger: VSCodeChannelLogger;

export declare class VSCodeChannelLogger {
    private output;
    constructor(title: string);
    private format;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
}

export declare function vscodeExtensionActivate(activate: IActivateFunction): IActivateFunction;

export declare function vscodeExtensionDeactivate(deactivate: IDeactivateFunction): IDeactivateFunction;

export { }
