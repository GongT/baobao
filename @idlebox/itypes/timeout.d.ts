declare type TimerHandler = string | Function;
declare function clearInterval(handle?: number): void;
declare function clearTimeout(handle?: number): void;
declare function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
