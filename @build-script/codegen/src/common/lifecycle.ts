import { ensureDisposeGlobal } from '@idlebox/common';

export function shutdown(code = process.exitCode) {
	ensureDisposeGlobal().finally(() => {
		process.exit(code);
	});
	return new Promise<never>(() => {}); // never resolve
}
