import { createRootLogger, EnableLogLevel } from '@idlebox/logger';
import * as chai from 'chai';
import promisePlugin from 'chai-as-promised';

chai.use(promisePlugin);

if (process.argv.includes('-d')) {
	createRootLogger('test', EnableLogLevel.verbose);
} else if (process.env.SILENT) {
	createRootLogger('test', EnableLogLevel.log);
} else {
	createRootLogger('test', EnableLogLevel.debug);
}

export const slowMode = process.argv.includes('--slow-mode');
