export interface IDebug {
	(message?: any, ...optionalParams: any[]): void;
}

export function getDebug(verbose: boolean): IDebug {
	if ((verbose as any) === 1) {
		return console.log.bind(console);
	}
	return verbose ? console.error.bind(console) : () => {};
}
