export interface IVolume {
	source: string;
	target: string;
	type: string;
}

export interface IOverlay {
	upper: string;
	target: string;
}

export type IUser = {};
export type IProcess = {};

export interface IContainerOptions {
	user?: IUser;
	process?: IProcess;
}

export interface IMountOptions {
	volumes?: IVolume[];
	overlay?: IOverlay[];
}

export interface ICommandToRun {
	commands: string[];
	cwd: string;
	extraEnv?: Record<string, string>;
}

export enum FsNodeType {
	/**
	 * 空白临时目录
	 */
	tmpfs = 0,
	/**
	 * 只读，可写但结束后失去
	 */
	volatile = 1,
	/**
	 * 读写目录
	 */
	passthru = 2,
	/**
	 * 空白临时目录
	 */
	readonly = 3,
}

export interface IMountInfo {
	target: string;
	source: string;
	fstype: string;
	options: string;
}
