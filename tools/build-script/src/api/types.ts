export  type IType = 'serial' | 'parallel';

export interface IActionMap {
	[id: string]: IActionDefine;
}

export interface IActionDefine {
	type: IType;
	exported: boolean;
	sequence: string[];
}

export interface IJobMap {
	[id: string]: IJobDefine;
}

export  type IJobDefine = string[];

export interface IBuildScriptJson {
	actions: IActionMap;
	jobs: IJobMap;
	plugins: string[];
}

export interface ExecFunc {
	(done: (error?: any) => void): Promise<void>;
}
