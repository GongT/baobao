import { argv } from '@idlebox/args/default';
import { createLogger, EnableLogLevel } from '@idlebox/logger';
import { useLogger } from './common/logger.js';

const l = createLogger('cli-static-generator');
const debug = argv.flag(['--debug', '-d']);
if (debug < 0) {
	l.enable(EnableLogLevel.error);
} else if (debug === 0) {
	l.enable(EnableLogLevel.log);
} else if (debug === 1) {
	l.enable(EnableLogLevel.debug);
} else {
	l.enable(EnableLogLevel.verbose);
}
useLogger(l);

export { makeIndexFile } from './common/make-index-file.js';
