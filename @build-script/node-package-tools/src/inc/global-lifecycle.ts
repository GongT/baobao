import { ensureDisposeGlobal } from '@idlebox/common';

export let isApplicationShuttingDown = false;

export function registerSignal() {
	process.on('SIGINT', () => {
		process.stderr.write('\n');
		isApplicationShuttingDown = true;
		ensureDisposeGlobal().finally(() => {
			process.exit(0);
		});
	});
}
