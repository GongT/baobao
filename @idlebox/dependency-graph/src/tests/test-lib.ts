import { createRootLogger, EnableLogLevel } from '@idlebox/logger';

if (process.argv.includes('-d')) {
	createRootLogger('test', EnableLogLevel.verbose);
} else if (process.env.SILENT) {
	createRootLogger('test', EnableLogLevel.log);
} else {
	createRootLogger('test', EnableLogLevel.debug);
}

export const slowMode = process.argv.includes('--slow-mode');
