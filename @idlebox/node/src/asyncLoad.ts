import { prettyPrintError } from '@idlebox/common';

export type AsyncMainFunction = () => Promise<void | number>;

export class ExitError extends Error {
	constructor(
		message: string,
		public readonly code: number = 1,
	) {
		super(message);
	}
}

type OnExit = (error?: Error) => Promise<any>;

/**
 * should do this before:
 * ```
 * setErrorLogRoot(require('path').dirname(__dirname));
 * ```
 **/
export function runMain(main: AsyncMainFunction, onExit?: OnExit) {
	Promise.resolve()
		.then(async () => {
			try {
				await main();
				await onExit?.();
			} catch (e: any) {
				await onExit?.(e);
				throw e;
			}
		})
		.catch((e) => {
			if (e instanceof ExitError) {
				if (e.code) {
					console.error('[exit] %s', e.message);
					process.exitCode = e.code;
				} else {
					process.exitCode = 0;
				}
			} else {
				prettyPrintError('main', e);
			}
			if (!process.exitCode) process.exitCode = 1;
		})
		.finally(() => {
			process.exit();
		});
}
