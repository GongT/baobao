import { createRootLogger, logger } from '../_environments/node.js';

createRootLogger('wow');

const l = 'such';
const o = { hello: 'world' };

logger.debug`wow, ${l} doge! ${o}!`;
console.log('----------------');
logger.debug('wow, such %s! %o?', l, o);
