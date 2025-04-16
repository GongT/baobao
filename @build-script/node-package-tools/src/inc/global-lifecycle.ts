import { ensureDisposeGlobal } from '@idlebox/common';

export let isApplicationShuttingDown = false;

export function registerSignal() {
	process.on('SIGINT', () => {
		isApplicationShuttingDown = true;
		ensureDisposeGlobal().finally(() => {
			process.exit(0);
		});
	});
}
