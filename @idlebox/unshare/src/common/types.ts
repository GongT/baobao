export interface IVolume {
	source: string;
	target: string;
	type: string;
}

export interface IOverlay {
	upper: string;
	target: string;
}

export interface IUser {}
export interface IProcess {}

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
