import { createGlobalLogger } from '../common/logger.global.js';
import { logger } from '../index.js';

createGlobalLogger('wow');

const l = 'such';
const o = { hello: 'world' };

logger.debug`wow, ${l} doge! ${o}!`;
console.log('----------------');
logger.debug('wow, such %s! %o?', l, o);
