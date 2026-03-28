// @ts-ignore
type ITimeoutType = NodeJS.Timeout;

declare type ITimerHandler = string | Function;
declare function clearInterval(handle?: ITimeoutType): void;
declare function clearTimeout(handle?: ITimeoutType): void;
declare function setInterval(handler: ITimerHandler, timeout?: ITimeoutType, ...arguments: any[]): ITimeoutType;
declare function setTimeout(handler: ITimerHandler, timeout?: ITimeoutType, ...arguments: any[]): ITimeoutType;
