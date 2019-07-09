declare const PROJECT_ROOT: string;
declare const SELF_ROOT: string;

declare type IType = 'serial' | 'parallel';

declare interface IActionMap {
	[id: string]: IActionDefine;
}

declare interface IActionDefine {
	type: IType;
	exported: boolean;
	sequence: string[];
}

declare interface IJobMap {
	[id: string]: IJobDefine;
}

declare type IJobDefine = string[];

declare interface IBuildScriptJson {
	actions: IActionMap;
	jobs: IJobMap;
	plugins: string[];
}

declare interface ExecFunc {
	(done: (error?: any) => void): Promise<void>;
}
