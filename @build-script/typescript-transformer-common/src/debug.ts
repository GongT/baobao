export interface IDebug {
	(message?: any, ...optionalParams: any[]): void;
}

let uid = 0;

/** @internal */
export let debugOut = getDebug(false);

export function getDebug(verbose: boolean): IDebug {
	if ((verbose as any) === 1) {
		return console.log.bind(console);
	}
	return verbose ? prefixedError(uid++) : () => {};
}

function prefixedError(id: number) {
	const title = `[${id.toFixed(0)}]`;
	return (msg: any, ...args: any[]) => {
		if (typeof msg === 'string') {
			console.error(title + ' ' + msg, ...args);
		} else {
			console.error(title, msg, ...args);
		}
	};
}
