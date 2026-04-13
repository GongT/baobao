import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';

registerNodejsExitHandler();

export const debug = argv.flag(['--debug', '-d']);
createRootLogger('scripts', debug > 1 ? EnableLogLevel.verbose : debug > 0 ? EnableLogLevel.debug : EnableLogLevel.auto);
