interface TinyConsole {
	log(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
}

declare const console: TinyConsole;

type Timer = number;

declare function setTimeout(cb: Function, ms: number): Timer;
