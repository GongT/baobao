import { createGlobalLogger } from '../common/logger.global.js';
import { createLogFile, logger } from '../index.js';

createGlobalLogger('wow');

logger.stream.pipe(createLogFile('test.log'));

const l = 'such';
const o = { hello: 'world' };

logger.error`wow, ${l} doge! ${o}!`;
logger.error('wow, such %s! %o?', l, o);
console.log('----------------');

logger.warn`wow, ${l} doge! ${o}!`;
logger.warn('wow, such %s! %o?', l, o);
console.log('----------------');

logger.info`wow, ${l} doge! ${o}!`;
logger.info('wow, such %s! %o?', l, o);
console.log('----------------');

logger.log`wow, ${l} doge! ${o}!`;
logger.log('wow, such %s! %o?', l, o);
console.log('----------------');

logger.success`wow, ${l} doge! ${o}!`;
logger.success('wow, such %s! %o?', l, o);
console.log('----------------');

logger.debug`wow, ${l} doge! ${o}!`;
logger.debug('wow, such %s! %o?', l, o);
console.log('----------------');

logger.verbose`wow, ${l} doge! ${o}!`;
logger.verbose('wow, such %s! %o?', l, o);
console.log('----------------');

logger.fatal`wow, ${l} doge! ${o}!`;
logger.fatal('wow, such %s! %o?', l, o);

// @ts-ignore
console.log('----------------');

// @ts-ignore
logger.error`this not happen`;
