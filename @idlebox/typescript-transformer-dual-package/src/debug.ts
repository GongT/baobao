export interface IDebug {
	(message?: any, ...optionalParams: any[]): void;
}

export function getDebug(verbose: boolean): IDebug {
	return verbose ? console.error.bind(console) : () => {};
}
