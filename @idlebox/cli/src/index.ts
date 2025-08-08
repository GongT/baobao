import { install } from '@idlebox/source-map-support';

install({ environment: 'node', ignore: true });

export enum ExitCode {
	/**
	 * 运行时发生各种无法预料的错误，例如网络突然断开等
	 */
	EXECUTION = 1,

	/**
	 * 在不期待SIGINT、SIGTERM的情况下，收到了这些信号进而退出
	 */
	INTERRUPT = 2,

	/**
	 * 使用方式错误，例如传入了不正确的参数
	 */
	USAGE = 3,

	/**
	 * 由于程序代码不完善导致的错误
	 */
	PROGRAM = 66,
}

export interface IApp {
	readonly debug: boolean;
	readonly verbose: boolean;
	readonly silent: boolean;
	readonly showHelp: boolean;
	readonly command: string;
	readonly color: boolean;
}

export * from './re-export.js';
export { app, makeApplication } from './startup.js';
