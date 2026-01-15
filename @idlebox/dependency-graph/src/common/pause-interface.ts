export const pause = Symbol('pause-object');

export interface IPauseableObject {
	[pause]?: IPauseControl;
}

export interface IPauseControl {
	isPaused(): boolean;
	pause(): Promise<void>;
	resume(): Promise<void>;
}

export function getPauseControl(obj: any): IPauseControl | undefined {
	return obj?.[pause] ?? undefined;
}
