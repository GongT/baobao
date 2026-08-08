import { argv } from '@idlebox/args/default';
import { createRootLogger, EnableLogLevel } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';
import { basename } from 'node:path';

registerNodejsExitHandler();

export const debug = argv.flag(['--debug', '-d']);
const f = basename(process.argv.at(1) ?? '').replace(/\.[tj]s$/, '');

createRootLogger(`myscript:${f}`, debug > 1 ? EnableLogLevel.verbose : debug > 0 ? EnableLogLevel.debug : EnableLogLevel.auto);
