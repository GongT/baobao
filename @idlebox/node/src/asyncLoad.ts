import { prettyPrintError } from './error/pretty';

export type AsyncMainFunction = () => Promise<void | number>;

export class ExitError extends Error {
	constructor(message: string, public readonly code: number = 1) {
		super(message);
	}
}

export function runMain(main: AsyncMainFunction) {
	Promise.resolve()
		.then(main)
		.catch((e) => {
			if (e instanceof ExitError) {
				console.error(e.message);
				process.exit(1);
			}

			// setErrorLogRoot(require('path').dirname(__dirname));
			prettyPrintError('build-script', e);
			return e.code || 1;
		})
		.then((code) => {
			process.exit(code || 0);
		});
}
