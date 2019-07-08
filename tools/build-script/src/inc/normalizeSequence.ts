export type IAction = (string[] | string)[];

export type IType = 'serial' | '';

export function buildSequence(type: IType, rootSeq: string[]): IAction {
	const ret: IAction = [];
}
