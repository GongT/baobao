import { prettyPrintError } from '@idlebox/node';

class ExitError extends Error {
	constructor(message: string, public readonly code: number = 1) {
		super(message);
	}
}

export function fatalError(msg: string): never {
	throw new ExitError(msg);
}

export function load(file: string) {
	Promise.resolve()
		.then(() => {
			return import(file);
		})
		.then((fn) => {
			return fn.default();
		})
		.catch((e) => {
			if (e instanceof ExitError) {
				console.error(e.message);
				process.exit(1);
			}

			// setErrorLogRoot(require('path').dirname(__dirname));
			prettyPrintError('build-script', e);
			process.exit(1);
		});
}
