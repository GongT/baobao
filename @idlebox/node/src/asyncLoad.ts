import { Exit, prettyPrintError } from '@idlebox/common';

export type AsyncMainFunction = () => Promise<undefined | number> | Promise<void>;

type OnExit = (error?: Error) => Promise<any>;

/**
 * should do this before:
 * ```
 * setErrorLogRoot(require('path').dirname(__dirname));
 * ```
 * @deprecated
 **/
export function executeMainFunction(main: AsyncMainFunction, onExit?: OnExit) {
	Promise.resolve()
		.then(async () => {
			try {
				const v = await main();
				if (typeof v === 'number') {
					process.exitCode = v;
				}
				await onExit?.();
			} catch (e: any) {
				await onExit?.(e);
				throw e;
			}
		})
		.catch((e) => {
			if (e instanceof Exit) {
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
