
export declare function arrayUpdate<T>(before: T[], after: T[]): {
    add: T[];
    del: T[];
    same: T[];
};

export declare function assertFunctionHasName(func: MaybeNamedFunction): void;

export declare function awaitIterator<T>(generator: Iterator<T>): Promise<T>;

export declare class CallbackList<Argument> {
    protected list: MyCallback<Argument>[];
    add(item: MyCallback<Argument>, name?: string): number;
    remove(item: MyCallback<Argument>): MyCallback<Argument>[] | undefined;
    run(argument: Argument): boolean;
}

export declare function camelCase(str: string): string;

export declare class CustomSet<Type = string> {
    protected registry: Type[];
    private finder;
    constructor(finder?: Finder<Type>);
    setFinder(finder: Finder<Type>): void;
    has(item: Type): boolean;
    add(item: Type): boolean;
    addAll(items: Type[]): Type[];
    remove(item: Type): boolean;
    removeAll(items: Type[]): Type[];
    readonly length: number;
    [Symbol.iterator](): Iterator<Type>;
    toArray(): Type[];
}

export declare interface DateFunction {
    (date: Date): string;
}

export declare function dateHuman(d: Date): string;

export declare function datetimeHuman(d: Date): string;

export declare class DelayCallbackList<Argument> {
    private delayArgument?;
    private delayComplete;
    protected list: MyDelayCallback<Argument>[];
    add(item: MyDelayCallback<Argument>, name?: string): void;
    run(argument: Argument): void;
}

export declare function escapeRegExp(str: string): string;

declare type Finder<Type> = (this: Type[], item: Type) => number;

export declare function functionName(func: Function): any;

export declare function getErrorFrame(e: Error, frame: number): string;

export declare interface IArrayUpdate<T> {
    add: T[];
    del: T[];
    same: T[];
}

export declare interface IFormatters {
    s: ITimeFormatter;
    m: ITimeFormatter;
    h: ITimeFormatter;
    d: ITimeFormatter;
}

export declare interface InitFunc<O, T> {
    (this: O): T;
}

export declare function initOnRead<O, T extends keyof O>(target: any, propertyKey: T, init: InitFunc<O, O[T]>): void;

export declare function isArraySame<T>(a1: T[], a2: T[]): boolean;

export declare interface ITimeFormatter {
    (s: number): string;
}

export declare interface IUniqueIdFactory<T> {
    (item: T): string;
}

export declare function lcfirst(str: string): string;

export declare function linux_case(str: string): string;

export declare function linux_case_hyphen(str: string): string;

export declare interface MaybeNamedFunction extends Function {
    displayName?: string;
}

export declare interface MyCallback<Argument> {
    displayName?: string;
    (param: Argument): void | undefined | boolean;
}

export declare interface MyDelayCallback<Argument> {
    displayName?: string;
    (param: Argument): void;
}

export declare interface NamedFunction extends Function {
    displayName: string;
}

export declare function nameFunction<T extends Function>(name: string, func: T): T & NamedFunction;

export declare function objectPath(obj: object, path: string): any;

export declare function pad2(s: number): string;

export declare function RegexpFinder(this: RegExp[], item: RegExp): number;

export declare function registerLocaleDateString(timeFn: DateFunction, dateFn: DateFunction): void;

export declare function registerLocaleTimeString(formatter: Partial<IFormatters>): void;

export declare function sizeHuman(size: number): string;

export declare function timeHuman(d: Date): string;

export declare function timeString(ms: number): string;

export declare function timeStringTiny(ms: number): string;

export declare function tryInspect(object: any): any;

export declare function ucfirst(str: string): string;

export declare function uniqueFilter<T>(idFactory?: IUniqueIdFactory<T>): (item: T) => boolean;

export { }
