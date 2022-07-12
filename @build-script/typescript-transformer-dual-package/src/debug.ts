export interface IDebug {
	debug(message?: any, ...optionalParams: any[]): void;
	error(message: string): void;
}

export function getDebug(verbose: boolean): IDebug {
	if (verbose) {
		return {
			debug: console.log,
			error: console.error,
		};
	}
	return {
		debug: () => {},
		error: console.error,
	};
}
