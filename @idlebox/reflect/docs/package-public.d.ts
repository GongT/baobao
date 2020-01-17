import { InitFunc } from '@idlebox/helpers';

export declare const bindThis: MethodDecorator;

export declare function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC>;

export declare const hookClassSymbol: unique symbol;

declare interface IConstructorOf<T> extends Object {
    new (...args: any[]): T;
}

declare interface IHooks<T, TC> {
    afterConstruct?: ((obj: T) => void)[];
    beforeConstruct?: ((obj: TC) => T | void)[];
}

export declare function init<O, T extends keyof O>(init: InitFunc<O, O[T]>): PropertyDecorator;

export declare const memo: MethodDecorator;

export declare const memorizeValueSymbol: unique symbol;

export declare function singleton(type?: SingletonType): ClassDecorator;

export declare const singletonSymbol: unique symbol;

export declare enum SingletonType {
    Throw = 0,
    Return = 1
}

export { }
